import basic from 'basic-auth';
import config from '../../config/config.js';
import authService from '../services/AuthService.js';
import sessionRepo from '../repos/sessionRepo.js';
import personRepo from '../repos/personRepo.js';
import { BadRequest, Unauthorized } from '../helpers/problem.js';

export async function Authenticate(req, res, next) {

	try {

		// COOKIE AUTHENTICATION
		const cookieName = config.COOKIE_NAME;
		const cookie = req.cookies[cookieName];

		if (cookie) {
			let cookieSession = await sessionRepo.findByUserKey(cookie, {include: {su: true, person: true}});
			if (!cookieSession) {
				res.clearCookie(cookieName);  //invalid cookie, clear it
			} else {

				/** The req.session should only be used for storing info
				 * related to the users browser session any authorization
				 * decision should use req.person set below Rationale: the
				 * session is only created and attached to browser sessions and
				 * we support more than that should almost be removed as the
				 * only current server use is auth which should user persons
				 * and policies
				 */

				req.session = {
					id       : cookieSession.id,
					personId : cookieSession.personId,
					suId     : cookieSession.suId || null,
					Su       : cookieSession.Su || null,
					Person   : cookieSession.Person || null,
				};

				//req.person is what should be checked for every authorization decision
				req.person = await personRepo.getPerson(req.session.personId);
				req.authType = 'cookie';
				req.session.csrfToken = authService.generateCSRFToken(cookie);
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
				const session = await sessionRepo.findByUserKey(token, { include: { person: true } });
				if (!session) {
					return Unauthorized(req, res,'Invalid Bearer token');
				}
				req.person = await personRepo.getPerson(session.personId);
				req.authType = 'bearer';

			} else {
				return BadRequest(req, res, 'The Authorization header uses an unrecognized authentication scheme.');
			}
		}

		next();

	} catch (err) {
		next(err);
	}
}
