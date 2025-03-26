import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimiter from 'express-rate-limit';
import pkg from 'uuid';
import expressWinston from 'express-winston';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { initialize } from 'express-openapi';
import swaggerUI from 'swagger-ui-express';
import config from './config/config.js';
import { barfPlease, systemStatus } from './api/controllers/public/status.js';
import errorHandler from './api/helpers/error.js';
import apiDoc from './api/routes/api-doc.js';

import coachPaths from './api/routes/paths/coach/index.js';
import extPaths from './api/routes/paths/ext/index.js';
import glpPaths from './api/routes/paths/glp/index.js';
import localPaths from './api/routes/paths/local/index.js';
import publicPaths from './api/routes/paths/public/index.js';
import tabPaths from './api/routes/paths/tab/index.js';
import userPaths from './api/routes/paths/user/index.js';

import {
	auth,
	keyAuth,
	tabAuth,
	coachAuth,
	localAuth,
} from './api/helpers/auth.js';

import db from './api/helpers/db.js';

import { debugLogger, requestLogger, errorLogger } from './api/helpers/logger.js';

const { v4: uuid } = pkg;
const app = express();

// Startup log message
debugLogger.info('Initializing API...');

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

// Authentication.  Context depends on the sub-branch so that secondary
// functions do not have to handle it in every call.

app.all([
	'/v1/user/:dataType/:id/*',
	'/v1/user/:dataType/:id',
	'/v1/user/*',
	'/v1/user',
], async (req, res, next) => {

	try {

		// Everything under /user should be a logged in user; and all functions
		// there apply only to the logged in user; no parameters allowed. For
		// /user/judge/ID, /user/student/ID, /user/entry/ID, /user/checker/ID,
		// /user/prefs/ID, check the perms against additional data

		req.session = await auth(req, res);

		if (!req.session) {
			return res.status(401).json('User: You are not logged in');
		}

		if (req.session.site_admin) {
			return next();
		}

		if (req.params.dataType === 'judge') {

			const judge = await req.db.summon(req.db.judge, req.params.id);

			if (judge.person !== req.session.person) {
				return res.status(401).json('User: You are not linked to that judge');
			}

		} else if (req.params.dataType === 'entry') {

			const students = await req.db.sequelize.query(`
				select student.id, student.person
					from student, entry_student es
				where es.entry = :entryId
					and es.student = student.id
			`, {
				replacements: {  entryId: req.params.id  },
				type: req.db.sequelize.QueryTypes.SELECT,
			});

			let ok = false;

			for (const student of students) {
				if (student.person === req.session.person) {
					ok = true;
				}
			}

			if (!ok) {
				return res.status(401).json('User: You are not linked to that entry');
			}

		} else if (req.params.dataType === 'student') {

			const student = await req.db.summon(req.db.student, req.params.id);

			if (student.person !== req.session.person) {
				return res.status(401).json('User: You are not linked to that student');
			}

		} else if (req.params.dataType === 'prefs') {

			const prefs = await req.db.sequelize.query(`
				select permission.id, permission.person
					from permission
				where permission.person = :personId
					and permission.chapter = :chapterId
					and permission.tag IN ('prefs', 'chapter')
			`, {
				replacements: { chapterId: req.params.id, personId: req.session.person },
				type: req.db.sequelize.QueryTypes.SELECT,
			});

			if (prefs.length > 0 && prefs[0].person === req.session.person) {
				return next();
			}

			return res.status(401).json('User: You are not linked to that entry');

		} else if (req.params.dataType === 'checker') {

			const prefs = await req.db.sequelize.query(`
				select permission.id, permission.person
					from permission
				where permission.person = :personId
					and permission.tourn = :tournId
					and permission.tag IN ('owner', 'tabber', 'checker')
			`, {
				replacements: { tournId: req.params.id, personId: req.session.person },
				type: req.db.sequelize.QueryTypes.SELECT,
			});

			if (prefs.length > 0 && prefs[0].person === req.session.person) {
				return next();
			}

			return res.status(401).json('User: You are not linked to that entry');

		} else {

			return next();
		}

	} catch (err) {
		next(err);
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

	try {
		// Functions that require tabber or owner permissions to a tournament overall
		req.session = await auth(req, res);

		if (!req.session) {
			return res.status(401).json('Tab: You are not logged in');
		}

		req.session = await tabAuth(req, res);

		if (
			typeof req.session?.perms !== 'object'
			|| (!req.session?.perms?.tourn[req.params.tournId])
		) {
			const subType = req.params.subType;
			return res
				.status(401)
				.json(`You do not have access to that tournament${subType ? `'s ${subType} functions` : ''}`);
		}

	} catch (err) {
		next(err);
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

	req.session = await auth(req, res);

	if (req.session) {
		const chapter = await coachAuth(req, res);
		if (typeof chapter === 'object' && chapter.id === parseInt(req.params.chapterId)) {
			req.chapter = chapter;
		} else {
			return res.status(401).json(`You do not have access to that institution`);
		}
	} else {
		return res.status(401).json('Coach: You are not currently logged in to Tabroom');
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

	try {
		req.session = await auth(req, res);

		if (req.session) {
			const response = await localAuth(req, res);
			if (typeof answer === 'object') {
				req[req.params.localType] = response.local;
				req.session.perms = { ...req.session.perms, ...response.perms };
				next();
			}
		} else {
			return res.status(401).json('Local: You are not currently logged in to Tabroom');
		}
	} catch (err) {
		next(err);
	}

	next();
});

app.all([
	'/v1/ext/:area/:tournId/*',
	'/v1/ext/:area/*',
	'/v1/ext/:area',
	'/v1/login',
], async (req, res, next) => {

	// All EXT requests are from external services and sources that do not
	// necessarily hook into the Tabroom authentication methods.  They must
	// have instead a basic authentication header with a Tabroom ID and
	// corresponding api_key setting for an account in person_settings.
	// Certain endpoints might be authorized to only some person accounts, such
	// as site admins for internal NSDA purposes, or Hardy because that guy is
	// super shady and I need to keep a specific eye on him.

	try {

		// Manually set an area for the login endpoint because it can't be intuited from the URL
		if (req.path === '/v1/login') {
			req.params.area = 'login';
		}

		req.session = await keyAuth(req, res);

		if (!req.session?.person) {
			req.session = await auth(req, res);
			if (!req.session?.settings[`api_auth_${req.params.area}`]) {
				return res.status(401).json(`That function is not accessible to your API credentials.  Key ${req.params.area} required`);
			}
		}

		if (!req.session?.person) {
			return res.status(401).json(`That function is not accessible to your API credentials.  Key ${req.params.area} required`);
		}
	} catch (err) {
		return next(err);
	}

	next();
});

app.all('/v1/glp/*', async (req, res, next) => {

	// GLP are Godlike Powers; aka site administrators

	try {
		req.session = await auth(req, res);

		if (!req.session) {
			return res.status(401).json('GLP: You are not logged in');
		}

		if (!req.session?.site_admin) {
			return res.status(401).json('That function is accessible to Tabroom site administrators only');
		}
	} catch (err) {
		next(err);
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
	dynamicMeta: (req, res, next) => {
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
	dynamicMeta: (req, res) => {
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
