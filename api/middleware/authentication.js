import db from '../helpers/db.js';
import getSettings from '../helpers/settings.js';
import { errorLogger } from '../helpers/logger.js';

//code for authentiocating a user, runs on every request
export async function useAuthentication(req, res, next) {

	//if already authenticated, skip
	if (!req.session || !req.session.id) {
		try {
			const cookie =
            req.cookies[req.config.COOKIE_NAME] ||
            req.headers['x-tabroom-cookie'];

			if (!cookie) {
				return next(); // no session, carry on
			}

			let session = await db.session.findOne({
				where: { userkey: cookie },
				include: [
					{ model: db.person, as: 'Person' },
					{ model: db.person, as: 'Su' },
				],
			});

			if (!session) {
				return next();
			}

			session.Su = await session.getSu();

			if (session.defaults) {
				try {
					session.defaults = JSON.parse(session.defaults);
				} catch (err) {
					errorLogger.info(`JSON parsing of defaults failed: ${err}`);
					session.defaults = {};
				}
			} else {
				session.defaults = {};
			}

			if (session.agent) {
				try {
					session.agent = JSON.parse(session.agent);
				} catch (err) {
					errorLogger.info(`JSON parsing of agent failed: ${err}`);
					session.agent = {};
				}
			} else {
				session.agent = {};
			}

			if (session.Su) {
				let realname = session.Person.first;

				if (session.Person.middle) {
					realname += ` ${session.Person.middle}`;
				}
				realname += ` ${session.Person.last}`;

				realname = `${session.Su.first} ${session.Su.last} as ${realname}`;

				session = {
					person: session.Person.id,
					site_admin: session.Person.site_admin,
					email: session.Person.email,
					name: realname,
					id: session.id,
					su: session.Su.id,
					...session.get({ raw: true }),
				};

				session.settings = await getSettings(
					'person',
					session.person,
					{ skip: ['paradigm', 'paradigm_timestamp', 'nsda_membership'] }
				);

			} else if (session.Person) {
				let realname = session.Person.first;

				if (session.Person.middle) {
					realname += ` ${session.Person.middle}`;
				}
				realname += ` ${session.Person.last}`;

				session = {
					id: session.id,
					person: session.Person.id,
					site_admin: session.Person.site_admin,
					email: session.Person.email,
					name: realname,
					...session.get({ raw: true }),
				};

				session.settings = await getSettings(
					'person',
					session.person,
					{ skip: ['paradigm', 'paradigm_timestamp', 'nsda_membership'] }
				);
			}
			//attach session to req object
			req.session = session;

			console.log(`Session is ${req.session}`);

		} catch (err) {
			return next(err);
		}
	}
	next();
}