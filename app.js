import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from 'express-rate-limit';
import uuid from 'uuid/v4.js';
import expressWinston from 'express-winston';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { initialize } from 'express-openapi';
import swaggerUI from 'swagger-ui-express';
import config from './config/config';
import { barfPlease, systemStatus } from './api/controllers/public/status';
import errorHandler from './api/helpers/error';
import apiDoc from './api/routes/api-doc';

import coachPaths from './api/routes/paths/coach/index';
import extPaths from './api/routes/paths/ext/index';
import glpPaths from './api/routes/paths/glp/index';
import localPaths from './api/routes/paths/local/index';
import publicPaths from './api/routes/paths/public/index';
import tabPaths from './api/routes/paths/tab/index';
import userPaths from './api/routes/paths/user/index';

import {
	auth,
	keyAuth,
	tabAuth,
	coachAuth,
	localAuth,
} from './api/helpers/auth';
import db from './api/helpers/db';

import { debugLogger, requestLogger, errorLogger } from './api/helpers/logger';

const app = express();

// Startup log message
debugLogger.info('Initializing API...');

// Enable Helmet security
app.use(helmet());

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
app.use('/v1/tab/:tournId/section/:sectionId/message', messageLimiter);
app.use('/v1/tab/:tournId/section/:sectionId/blast', messageLimiter);
app.use('/v1/tab/:tournId/section/:sectionId/poke', messageLimiter);

const searchLimiter = rateLimiter({
	windowMs : config.SEARCH_RATE_WINDOW || 30 * 1000 , // 30 seconds
	max      : config.SEARCH_RATE_MAX || 5            , // limit each to 5 search requests per 30 seconds
});

app.use('/v1/public/search', searchLimiter);

// Add a unique UUID to every request, and add the configuration for easy transport
app.use((req, res, next) => {
	req.uuid = uuid();
	req.config = config;
	return next();
});

// Enable CORS Access, hopefully in a way that means I don't
// have to fight with it ever again.
const corsOptions = {
	origin : [
		'https://www.tabroom.com',
		'https://static.tabroom.com',
		'http://old.dev.tabroom.com',
		'http://new.dev.tabroom.com',
		'http://old.staging.tabroom.com',
		'http://new.staging.tabroom.com',
		'https://tabweb1',
	],
	optionsSuccessStatus : 204,
	credentials          : true,
};

app.use('/v1', cors(corsOptions));

// Log all requests
app.use(expressWinston.logger({
	winstonInstance : requestLogger,
	meta            : true,
	env             : process.env.NODE_ENV,
	dynamicMeta: (req, res) => {
		return {
			logCorrelationId: req.uuid,
		};
	},
}));

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

// Database handle volleyball; don't have to call it in every last route.
// For I am lazy, and apologize not.

app.use((req, res, next) => {
	req.db = db;
	return next();
});

// Authentication.  Context depends on the sub-branch so that secondary
// functions do not have to handle it in every call.

app.all(['/v1/user/*', '/v1/user/:dataType/:id', '/v1/user/:dataType/:id/*'], async (req, res, next) => {

	// Everything under /user should be a logged in user; and all functions there
	// apply only to the logged in user; no parameters allowed.
	// For /user/judge/ID, /user/student/ID, /user/entry/ID, /user/checker/ID,
	// /user/prefs/ID, check the perms against additional data

	req.session = await auth(req, res);

	if (req.session) {
		next();
	} else {
		return res.status(401).json('You are not logged in');
	}
});

const tabRoutes = [
	'/v1/tab/:tournId',
	'/v1/tab/:tournId/:subType',
	'/v1/tab/:tournId/:subType/:typeId',
	'/v1/tab/:tournId/:subType/:typeId/*',
];

app.all(tabRoutes, async (req, res, next) => {

	// Functions that require tabber or owner permissions to a tournament overall
	req.session = await auth(req, res);
	req.session = await tabAuth(req, res);

	if (typeof req.session.perms !== 'object') {
		res.status(401).json('You do not have access to that tournament area');
		return;
	} else {
		next();
	}
});

const coachRoutes = [
	'/v1/coach/:chapterId',
	'/v1/coach/:chapterId/*',
];

app.all(coachRoutes, async (req, res, next) => {

	// apis related to the coach or directors of a program.  Prefs only
	// access is in the /user/prefs directory because it's such a bizarre
	// one off

	req.session = await auth(req, res);
	if (req.session) {
		const chapter = await coachAuth(req, res);
		if (typeof answer === 'object') {
			req.chapter = chapter;
			next();
		}
	} else {
		res.status(401).json('You are not currently logged in to Tabroom');
	}
});

const localRoutes = [
	'/v1/local/:localType/:localId',
	'/v1/local/:localType/:localId/*',
];

app.all(localRoutes, async (req, res, next) => {

	// apis related to administrators of districts (the committee), or
	// a region, or an NCFL diocese, or a circuit.

	req.session = await auth(req, res);

	if (req.session) {
		const response = await localAuth(req, res);
		if (typeof answer === 'object') {
			req[req.params.localType] = response.local;
			req.session.perms = { ...req.session.perms, ...response.perms };
			next();
		}
	} else {
		return res.status(401).json('You are not currently logged in to Tabroom');
	}
});

app.all(['/v1/ext/:area', '/v1/ext/:area/*', '/v1/ext/:area/:tournId/*'], async (req, res, next) => {

	// All EXT requests are from external services and sources that do not necessarily
	// hook into the Tabroom authentication methods.  They must have instead a basic
	// authentication header with a Tabroom ID and corresponding api_key setting for an
	// account in person_settings.  Certain endpoints might be authorized to only some
	// person accounts, such as site admins for internal NSDA purposes, or Hardy because
	// that guy is super shady and I need to keep a specific eye on him.

	req.person = await keyAuth(req, res);

	if (req.person) {
		next();
	}
});

app.all('/v1/glp/*', async (req, res, next) => {
	req.session = await auth(req, res);
	if (!req.session?.site_admin) {
		return res.status(401).json('That function is accessible to Tabroom site administrators only');
	} else {
		next();
	}
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
	dynamicMeta: (req, res, next) => {
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
