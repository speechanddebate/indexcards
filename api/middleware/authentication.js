import basic from 'basic-auth';
import config from '../../config/config.js';
import sessionRepo from '../repos/sessionRepo.js';
import personRepo from '../repos/personRepo.js';
import { BadRequest, Unauthorized } from '../helpers/problem.js';

export async function Authenticate(req, res, next) {

	try {

		// COOKIE AUTHENTICATION
		const cookieName = config.COOKIE_NAME;
		const cookie = req.cookies[cookieName] || req.headers['x-tabroom-cookie'];

		if (cookie) {
			let cookieSession = await sessionRepo.findByUserKey(cookie);
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

				const settings = await personRepo.getPersonSettings(
					cookieSession.person.id,
					{ skip: ['paradigm', 'paradigm_timestamp', 'nsda_membership'] }
				);

				req.session = {
					id        : cookieSession.id,
					person    : cookieSession.person.id,
					siteAdmin : cookieSession.person.siteAdmin,
					email     : cookieSession.person.email,
					name      : `${cookieSession.person?.first} ${cookieSession.person?.last}`,
					first     : cookieSession.person.first,
					last      : cookieSession.person.last,
					su        : cookieSession.su?.id || null,
					settings,
				};

				//req.person is what should be checked for every authorization decision
				req.person = await personRepo.getById(req.session.person);
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
				req.person = await personRepo.getPersonByApiKey(credentials.name, credentials.pass);

				if (!req.person) {
					return Unauthorized(req, res,'Invalid API key');
				}

			} else {
				return BadRequest(req, res, 'The Authorization header uses an unrecognized authentication scheme.');
			}
		}

		next();

	} catch (err) {
		next(err);
	}
}
