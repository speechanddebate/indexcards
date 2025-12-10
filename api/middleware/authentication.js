import basic from 'basic-auth';
import config from '../../config/config.js';
import sessionRepo from '../repos/sessionRepo.js';
import personRepo from '../repos/personRepo.js';
export async function Authenticate(req, res, next) {
	try {
		let session = null;
		let person = null;

		// COOKIE AUTHENTICATION
		const cookieName = config.COOKIE_NAME;
		const cookie = req.cookies[cookieName] || req.headers['x-tabroom-cookie'];

		if (cookie) {
			let cookieSession = await sessionRepo.findByUserKey(cookie);
			if (!cookieSession) {
				res.clearCookie(cookieName);  //invalid cookie, clear it
			} else {
				/** The req.session should only be used for storing info related to the users browser session
				 *  any authorization decision should use req.person set below
				 * Rationale: the session is only created and attached to browser sessions and we support more than that
				 * should almost be removed as the only current server use is auth which should user persons and policies
				 */
				session = {
					id          : cookieSession.id,
					person      : cookieSession.person.id,
					siteAdmin   : cookieSession.person.siteAdmin,
					email       : cookieSession.person.email,
					name        : `${cookieSession.person?.first} ${cookieSession.person?.last}`,
					su          : cookieSession.su ? cookieSession.su.id : null,
					settings    : await personRepo.getPersonSettings(cookieSession.person.id,{ skip: ['paradigm', 'paradigm_timestamp', 'nsda_membership'] }),
				};
				req.session = session;
				person = await personRepo.getById(session.person);
			}
		}

		if(req.headers?.authorization){
			if(req.headers.authorization.startsWith('Basic ')){
				//BASIC AUTHENTICATION
				const credentials = basic.parse(req.headers.authorization);
				if (!credentials || !credentials.name || !credentials.pass) {
					return res.status(400).json({ message: 'Invalid authorization header format' });
				}
				person = await personRepo.getPersonByApiKey(credentials.name, credentials.pass);
				if (!person) {
					return res.status(401).json({ message: 'Invalid API key credentials' });
				}
			}
			else{
				return res.status(400).json({ message: 'Invalid authorization header format' });
			}
		}

		//This req.person is what should be checked for ever authorization decision
		if (person) {
			req.person = person;
		};
		next();
	} catch (err) {
		next(err);
	}
}