import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { v4 as uuid } from 'uuid';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import config from './config/config.js';
import errorHandler from './api/helpers/errors/errorHandler.js';
import { Authenticate } from './api/middleware/authentication.js';
import csrfMiddleware from './api/middleware/csrfMiddleware.js';
import v1Router from './api/routes/routers/v1/indexRouter.js';
import { rateLimiterMiddleware } from './api/middleware/rateLimiter.js';

import {
	localAuth,
} from './api/helpers/auth.js';

import db from './api/data/db.js';
import logger, { setupLoggers, setupRequestLogging } from './api/helpers/logger.js';
import { Forbidden, Unauthorized } from './api/helpers/problem.js';

setupLoggers();

const app = express();

// Startup log message
logger.info('Initializing API...');
logger.info(`Loading environment ${process.env?.NODE_ENV}`);

// Enable Helmet security
app.use(helmet({
	contentSecurityPolicy: false, //helmet v3 had this off by default
}));

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

app.get('/v1/ip', (request, response) => response.send(request.ip));

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

if (process.env.NODE_ENV === 'development') {
	// Pretty print JSON in the dev environment
	app.use(bodyParser.json());
	app.set('json spaces', 4);
}

// Parse cookies and add them to the session
app.use(cookieParser());

// Authenticate all requests and set req.actor
app.use(Authenticate);

if (process.env.NODE_ENV !== 'test'
	&& process.env.NODE_ENV !== 'development'
) {
	// Enable getting forwarded client IP from proxy
	const proxyNumber = config.PROXY_NUMBER;
	if (proxyNumber !== 0) app.enable('trust proxy', proxyNumber);
	app.use(rateLimiterMiddleware);
}

app.use(csrfMiddleware);

// Log all requests
app.use(setupRequestLogging);
app.use('/v1',v1Router);

app.use('/v1/local', async (req, res, next) => {

	// APIs related to administrators of districts (the committee), or a
	// region, or an NCFL diocese, or a circuit.

	if (!req.actor || req.actor.type === 'anonymous') {
		return Unauthorized(req, res, 'Admin: You are not logged in.');
	}

	const response = await localAuth(req, res);

	if (typeof response === 'object') {
		req[req.params.localType] = response.local;
		req.session.perms = { ...req.session.perms, ...response.perms };
		next();
	} else {
		return Forbidden(req, res, `Admin : You do not have the access required.`);
	}
});

// Final fallback error handling
app.use(errorHandler);

// Start server
const port = process.env.PORT || config.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
	app.listen(port, () => {
		logger.info(`Server started. Listening on port ${port}`);
	});
}

export default app;
