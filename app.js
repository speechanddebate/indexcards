import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from 'express-rate-limit';
import {v4 as uuid} from 'uuid';
import expressWinston from 'express-winston';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { initialize } from 'express-openapi';
import swaggerUI from 'swagger-ui-express';
import config from './config/config.js';
import { barfPlease, systemStatus } from './api/controllers/public/status.js';
import errorHandler from './api/helpers/error.js';
import apiDoc from './api/routes/api-doc.js';
import { Authenticate } from './api/middleware/authentication.js';
import { requireAreaAccess } from './api/middleware/authorization.js';
import coachPaths from './api/routes/paths/coach/index.js';
import extPaths from './api/routes/paths/ext/index.js';
import glpPaths from './api/routes/paths/glp/index.js';
import localPaths from './api/routes/paths/local/index.js';
import publicPaths from './api/routes/paths/public/index.js';
import tabPaths from './api/routes/paths/tab/index.js';
import userPaths from './api/routes/paths/user/index.js';

import {
	tabAuth,
	coachAuth,
	localAuth,
} from './api/helpers/auth.js';

import db from './api/data/db.js';
import { debugLogger, requestLogger, errorLogger } from './api/helpers/logger.js';

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
	max      : config.RATE_MAX || 10000             , // limit each IP to 100000 requests per windowMs
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
	origin : config.CORS_ORIGINS,
	optionsSuccessStatus : 204,
	credentials          : true,
};

app.use('/v1', cors(corsOptions));

// Parse body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: ['json', 'application/*json'], limit: '10mb' }));
app.use(bodyParser.text({ type: '*/*', limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
	// Pretty print JSON in the dev environment
	app.use(bodyParser.json());
	app.set('json spaces', 4);
}

// Parse cookies and add them to the session
app.use(cookieParser());

// Authenticate all requests and set req.session if valid
app.use(Authenticate);

app.all(['/v1/user/*', '/v1/user/:dataType/:id', '/v1/user/:dataType/:id/*'], async (req, res, next) => {
	if (!req.session) {
		return res.status(401).json({
			error   : false,
			message : `User: You are not logged in.`,
		});
	}
	next();
});

const tabRoutes = [
	'/v1/tab/:tournId',
	'/v1/tab/:tournId/:subType',
	'/v1/tab/:tournId/:subType/:typeId',
	'/v1/tab/:tournId/:subType/:typeId/*',
	'/v1/tab/:tournId/:subType/:typeId/*/*',
	'/v1/tab/:tournId/:subType/:typeId/*/*/*',
];

app.all(tabRoutes, async (req, res, next) => {

	if (!req.session) {
		return res.status(401).json({
			error   : false,
			message : `Tab: You are not logged in.`,
		});
	}

	req.session = await tabAuth(req, res);

	if (typeof req.session?.perms !== 'object') {
		return res.status(401).json({
			error   : true,
			message : `You do not have access to that part of that tournament`,
		});
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

	if (!req.session) {
		return res.status(401).json({
			error   : false,
			message : `Coach: You are not logged in.`,
		});
	}

	const chapter = await coachAuth(req, res);

	if (typeof chapter === 'object' && chapter.id === parseInt(req.params.chapterId)) {
		req.chapter = chapter;
	} else {
		return res.status(401).json({
			error   : true,
			message : `You do not have access to that part of that institution`,
		});
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

	if (!req.session) {
		return res.status(401).json({
			error   : false,
			message : `Admin: You are not logged in.`,
		});
	}

	const response = await localAuth(req, res);

	if (typeof answer === 'object') {
		req[req.params.localType] = response.local;
		req.session.perms = { ...req.session.perms, ...response.perms };
		next();
	} else {
		return res.status(401).json({
			error   : true,
			message : `Admin : You do not have the access required.`,
		});
	}

	next();
});

app.all(['/v1/ext/:area', '/v1/ext/:area/*', '/v1/ext/:area/:tournId/*'],requireAreaAccess, async (req, res, next) => {

	// All EXT requests are from external services and sources that do not
	// necessarily hook into the Tabroom authentication methods.  They must
	// have instead a basic authentication header with a Tabroom ID and
	// corresponding api_key setting for an account in person_settings. Certain
	// endpoints might be authorized to only some person accounts, such as site
	// admins for internal NSDA purposes, or Hardy because that guy is super
	// shady and I need to keep a specific eye on him.

	// if (req.session) {
	// 	if (req.params.area === 'tourn') {
	// 		req.session = await tabAuth(req, res);
	// 	} else if (!req.session?.settings[`api_auth_${req.params.area}`]) {
	// 		// Give the keyAuth a chance to work
	// 		delete req.session;
	// 	}
	// }

	// if (!req.session) {
	// 	try {
	// 		await keyAuth(req, res);
	// 	} catch(err) {
	// 		return res.status(401).json({
	// 			error   : true,
	// 			message : `Key API authentication failed: ${err}`,
	// 		});
	// 	}
	// }

	// if (!req.session || !req.session.person) {
	// 	return res.status(401).json({
	// 		error   : true,
	// 		message : `That function is not accessible to your API credentials.  Key ${req.params.area} required`,
	// 	});
	// }

	next();
});

app.all('/v1/glp/*', async (req, res, next) => {

	// GLP are Godlike Powers; aka site administrators

	if (!req.session) {
		return res.status(401).json({
			error     : true,
			message   : `GLP : You are not logged in.`,
		});
	}

	if (!req.session?.site_admin) {
		return res.status(401).json({
			error   : true,
			message : `That function is accessible to Tabroom site administrators only`,
		});
	}

	next();
});

const systemPaths = [
	{ path : '/status', module : systemStatus },
	{ path : '/barf', module   : barfPlease },
];

// Combine the various paths into one
const paths = [
	...systemPaths,
	...coachPaths,
	...extPaths,
	...glpPaths,
	...localPaths,
	...publicPaths,
	...tabPaths,
	...userPaths,
];

// Initialize OpenAPI middleware
const apiDocConfig = initialize({
	app,
	apiDoc,
	paths,
	promiseMode     : true,
	docsPath        : '/docs',
	errorMiddleware : errorHandler,
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

// Swagger UI interface for the API
app.use('/v1/apidoc', swaggerUI.serve, swaggerUI.setup(apiDocConfig.apiDoc));

// Start server
const port = process.env.PORT || config.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
	app.listen(port, () => {
		debugLogger.info(`Server started. Listening on port ${port}`);
	});
}

export default app;
