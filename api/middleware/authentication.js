import basic from 'basic-auth';
import config from '../../config/config.js';
import authService from '../services/AuthService.js';
import sessionRepo from '../repos/sessionRepo.js';
import personRepo from '../repos/personRepo.js';
import { createActor } from './authorization/authorization.js';
import { BadRequest, Unauthorized } from '../helpers/problem.js';

export async function Authenticate(req, res, next) {

	let session = null;

	try {

		// COOKIE AUTHENTICATION
		const cookieName = config.COOKIE_NAME;
		const cookie = req.cookies[cookieName] || req.headers[config.SESSION_HEADER];

		if (cookie) {

			let cookieSession = await sessionRepo.findByUserKey(cookie, {include: {su: true, person: true}});

			if (!cookieSession) {
				res.clearCookie(cookieName);  //invalid cookie, clear it
			} else {
				session = cookieSession;
				req.authType = 'cookie';
				req.csrfToken = authService.generateCSRFToken(cookie);
			}
		}

		if(req.headers?.authorization){
			if(req.headers.authorization.startsWith('Basic ')){

				//BASIC AUTHENTICATION
				const credentials = basic.parse(req.headers.authorization);

				if (!credentials || !credentials.name || !credentials.pass) {
					return BadRequest(req, res, 'The Authorization header is malformed. Expected format: Basic base64(user:key).');
				}

				//req.person is what should be checked for every authorization decision
				const person = await personRepo.getPerson(credentials.name, {settings: ['api_key']});

				if (!person || person.settings?.api_key !== credentials.pass) {
					return Unauthorized(req, res,'Invalid API key');
				}

				req.person = person;
				req.authType = 'basic';

			} else if (req.headers.authorization.startsWith('Bearer ')) {

				//BEARER AUTHENTICATION. allow the user to send their session token as a bearer token
				const token = req.headers.authorization.substring(7).trim();
				if (!token) {
					return BadRequest(req, res, 'The Authorization header is malformed. Expected format: Bearer token.');
				}
				const bearerSession = await sessionRepo.findByUserKey(token, {include: {su: true, person: true}});
				if (!bearerSession) return Unauthorized(req, res,'Invalid Bearer token');
				session = bearerSession;
				req.authType = 'bearer';

			} else {
				return BadRequest(req, res, 'The Authorization header uses an unrecognized authentication scheme.');
			}
		}

		if(session){

			req.session = {
				id       : session.id,
				personId : session.personId,
				suId     : session.suId || null,
				Su       : session.Su || null,
				Person   : session.Person || null,
			};

			//deprecated, use req.actor for auth and req.session.Person for anything that MUST be done by a person
			req.person = await personRepo.getPerson(req.session.suId ?? req.session.personId);
		}
		//req.actor is what should be checked for every authorization decision
		req.actor = createActor(req);
		next();

	} catch (err) {
		next(err);
	}
}
