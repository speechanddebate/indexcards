/* eslint-disable-next-line import/no-unresolved */
import { encrypt, verify } from 'unixcrypt';

// Accept a email and password and verify that they're correct, and create &
// return a session object.  Not yet complete.

const login = async (req) => {

	const db = req.db;

	if (req.params.email && req.params.password) {

		const persons = await db.sequelize.query(`
			select person.id, person.password, person.site_admin, person.email
			from person
			where person.email = :email
		`, {
			replacements: { email: req.params.email },
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (persons.length > 0) {

			const person = persons[0];
			const verified = verify(req.params.password, person.password);

			if (!verified) {
				return 'Password was incorrect!';
			}

			const now = new Date();
			const userkey = encrypt(req.uuid);

			const sessionTemplate = {
				person     : person.id,
				ip         : '127.0.0.1',
				created_at : now.toJSON(),
				userkey,
			};

			const session = await db.session.create(sessionTemplate);

			// Create the session in the database here after you test it. oh.
			// and figure out how to set a cookie.  sigh.

			// These extra hooks do not go into the database so set them after.

			session.site_admin = person.site_admin;
			session.name = `${person.first} ${person.last}`;
			session.email = person.email;
			session.first = person.first;
			session.email = person.email;

			return session;

		}
		return `No user found for email ${req.params.email}`;
	}
};

export default login;

