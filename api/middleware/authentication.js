import basic from 'basic-auth';
import config from '../../config/config.js';
import sessionRepo from '../repos/sessionRepo.js';
import personRepo from '../repos/personRepo.js';
export async function Authenticate(req, res, next) {
	try {
		// If the user is already authenticated, skip
		if (req.session?.id) {
			return next();
		}

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
				session = cookieSession;
				person = await personRepo.getById(session.person.id);
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

		//parse and format the session object. This object is attaches to all requests and is what later functions use to determine user access
		if (session) {
			//build real name
			let realname = session.person.first;
			if (session.person.middle) {
				realname += ` ${session.person.middle}`;
			}
			realname += ` ${session.person.last}`;
			if (session.su) {
				realname = `${session.su.first} ${session.su.last} as ${realname}`;
			}

			session = {
				id          : session.id,
				person      : session.person.id,
				site_admin  : session.person.siteAdmin, //should rename to siteAdmin but i dont want to find all references right now
				email       : session.person.email,
				name        : realname,
				su          : session.su ? session.su.id : null,
				settings    : await personRepo.getPersonSettings(session.person.id,{ skip: ['paradigm', 'paradigm_timestamp', 'nsda_membership'] }),
			};

			req.session = session;
		}

		/** Everything that downstream functions need to know about the authenticated user should be stored in req.user
		 * currently req.session is used throughout the codebase to determine user access, so we keep that for now
		 * but I need to talk to palmer about possibly standardizing on req.user instead. the session information can be stored in req.user.session if needed.
		 * I need to figure out if req.session represents a user or if it represents a users session. if the latter, req.user makes more sense.
		 */

		else if (person) {
			//no session but we have a person from basic auth
			req.user = {
				id          : person.id,
				site_admin  : person.siteAdmin,
				email       : person.email,
				name        : `${person.first} ${person.last}`,
				settings    : await personRepo.getPersonSettings(person.id,{ skip: ['paradigm', 'paradigm_timestamp', 'nsda_membership'] }),
			};

		} else {
			req.session = null;
		}

		next();
	} catch (err) {
		next(err);
	}
}