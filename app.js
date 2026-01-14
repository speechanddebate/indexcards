import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from 'express-rate-limit';
import {v4 as uuid} from 'uuid';
import expressWinston from 'express-winston';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import config from './config/config.js';
import errorHandler from './api/helpers/error.js';
import { Authenticate } from './api/middleware/authentication.js';
import csrfMiddleware from './api/middleware/csrfMiddleware.js';
import v1Router from './api/routes/routers/v1/indexRouter.js';

import {
	tabAuth,
	coachAuth,
	localAuth,
} from './api/helpers/auth.js';

import db from './api/data/db.js';

import { debugLogger, requestLogger, errorLogger } from './api/helpers/logger.js';
import { Forbidden, Unauthorized } from './api/helpers/problem.js';

const app = express();

// Startup log message
debugLogger.info('Initializing API...');
debugLogger.info(`Loading environment ${process.env?.NODE_ENV}`);

// Enable Helmet security
app.use(helmet());

// Add a unique UUID to every request, and add the configuration for easy
// transport
//
// Database handle volleyball; don't have to call it in every last route. For I
// am lazy, and apologize not.

app.use((req, res, next) => {
	req.uuid   = uuid();
	req.config = config;
	req.db     = db;
	return next();
});

// Enable getting forwarded client IP from proxy
app.enable('trust proxy', 1);
app.get('/v1/ip', (request, response) => response.send(request.ip));

// Rate limit all requests
const limiter = rateLimiter({
	windowMs : config.RATE_WINDOW || 15 * 60 * 1000 , // 15 minutes
	max      : config.RATE_MAX || 10000, // limit each IP to 100000 requests per windowMs
});
app.use(limiter);

const messageLimiter = rateLimiter({
	windowMs : config.MESSAGE_RATE_WINDOW || 15 * 1000 , // 30 seconds
	max      : config.MESSAGE_RATE_MAX || 1            , // limit each to 2 blasts requests per 30 seconds
	message  : `
		You have reached your rate limit on messages which is ${config.MESSAGE_RATE_MAX} .
		Please do not blast people that persistently.
	`,
});

// Can we find a way to match these on the last verb? -- CLP, dreaming instead of googling.

app.use('/v1/tab/:tournId/round/:roundId/message', messageLimiter);
app.use('/v1/tab/:tournId/round/:roundId/blast', messageLimiter);
app.use('/v1/tab/:tournId/round/:roundId/poke', messageLimiter);
app.use('/v1/tab/:tournId/timeslot/:timeslotId/message', messageLimiter);
app.use('/v1/tab/:tournId/timeslot/:timeslotId/blast', messageLimiter);
app.use('/v1/tab/:tournId/timeslot/:timeslotId/poke', messageLimiter);
app.use('/v1/tab/:tournId/section/:sectionId/blastMessage', messageLimiter);
app.use('/v1/tab/:tournId/section/:sectionId/blastPairing', messageLimiter);
app.use('/v1/tab/:tournId/section/:sectionId/poke', messageLimiter);

const searchLimiter = rateLimiter({
	windowMs : config.SEARCH_RATE_WINDOW || 30 * 1000 , // 30 seconds
	max      : config.SEARCH_RATE_MAX || 5            , // limit each to 5 search requests per 30 seconds
});

app.use('/v1/public/search', searchLimiter);

// Enable CORS Access, hopefully in a way that means I don't
// have to fight with it ever again.
const corsOptions = {
	methods              : ['GET', 'POST', 'DELETE', 'PUT'],
	optionsSuccessStatus : 204,
	credentials          : true,
	origin               : config.CORS_ORIGINS,
};

app.use('/v1', cors(corsOptions));

// Parse body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: ['json', 'application/*json'], limit: '10mb' }));
app.use(bodyParser.text({ type: '*/*', limit: '10mb' }));

debugLogger.info(`Loading environment ${process.env?.NODE_ENV}`);

if (process.env.NODE_ENV === 'development') {
	// Pretty print JSON in the dev environment
	app.use(bodyParser.json());
	app.set('json spaces', 4);
}

// Parse cookies and add them to the session
app.use(cookieParser());

// Authenticate all requests and set req.person if valid
app.use(Authenticate);
app.use(csrfMiddleware);
app.use('/v1',v1Router);

app.all(['/v1/user/*', '/v1/user/:dataType/:id', '/v1/user/:dataType/:id/*'], async (req, res, next) => {
	if (!req.person) {
		return Unauthorized(req, res, 'User: You are not logged in.');
	}
	next();

});

const tabRoutes = [
	'/v1/tab/:tournId/:subType/:typeId',
	'/v1/tab/:tournId/:subType/:typeId/*',
	'/v1/tab/:tournId/:subType/:typeId/*/*',
	'/v1/tab/:tournId/:subType/:typeId/*/*/*',
	'/v1/tab/:tournId/:subType',
	'/v1/tab/:tournId',
];

app.all(tabRoutes, async (req, res, next) => {

	if (!req.person) {
		return Unauthorized(req, res, 'Tab: You are not logged in.');
	}

	req.session = await tabAuth(req, res);

	if (typeof req.session?.perms !== 'object') {
		return Forbidden(req, res, `You do not have access to that part of that tournament`);
	}
	next();
});

const coachRoutes = [
	'/v1/coach/:chapterId',
	'/v1/coach/:chapterId/*',
];

app.all(coachRoutes, async (req, res, next) => {

	// apis related to the coach or directors of a program.  Prefs only
	// access is in the /user/prefs directory because it's such a bizarre
	// one off

	if (!req.person) {
		return Unauthorized(req, res, 'Coach: You are not logged in.');
	}

	const chapter = await coachAuth(req, res);

	if (typeof chapter === 'object' && chapter.id === parseInt(req.params.chapterId)) {
		req.chapter = chapter;
	} else {
		return Forbidden(req, res, `You do not have access to that part of that institution`);
	}

	next();
});

const localRoutes = [
	'/v1/local/:localType/:localId',
	'/v1/local/:localType/:localId/*',
];

app.all(localRoutes, async (req, res, next) => {

	// apis related to administrators of districts (the committee), or a
	// region, or an NCFL diocese, or a circuit.

	if (!req.person) {
		return Unauthorized(req, res, 'Admin: You are not logged in.');
	}

	const response = await localAuth(req, res);

	if (typeof answer === 'object') {
		req[req.params.localType] = response.local;
		req.session.perms = { ...req.session.perms, ...response.perms };
		next();
	} else {
		return Forbidden(req, res, `Admin : You do not have the access required.`);
	}

	next();
});

// Log global errors with Winston
app.use(expressWinston.errorLogger({
	winstonInstance : errorLogger,
	meta            : true,
	dynamicMeta: (req) => {
		return {
			logCorrelationId: req.uuid,
		};
	},
}));

// Log all requests
app.use(expressWinston.logger({
	winstonInstance : requestLogger,
	meta            : true,
	env             : process.env.NODE_ENV,
	dynamicMeta: (req) => {
		return {
			logCorrelationId: req.uuid,
		};
	},
}));

// Final fallback error handling
app.use(errorHandler);

// Start server
const port = process.env.PORT || config.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
	app.listen(port, () => {
		debugLogger.info(`Server started. Listening on port ${port}`);
	});
}

export default app;
