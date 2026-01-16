import db from '../../api/data/db.js';

const data = (props = {}) => {
	const defaultProps = {
		// Generate random characters for the email
		email: `user_${Math.random().toString(36).substring(2, 10)}@example.com`,
		first: 'Test',
		middle: '',
		last: 'User',
		gender: null,
		pronoun: null,
		no_email: false,
		street: null,
		city: null,
		state: null,
		zip: null,
		postal: null,
		country: null,
		tz: null,
		phone: null,
		site_admin: false,
		nsda: null,
		password: null,
		accesses: 0,
		last_access: null,
		pass_timestamp: null,
		timestamp: new Date(),
		created_at: new Date(),
	};

	return Object.assign({}, defaultProps, props);
};

export default async function (props = {}) {
	return db.person.create(data(props));
}