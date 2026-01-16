import db from '../../api/data/db.js';

/**
 * Generate an object which contains attributes needed
 * to successfully create a user instance.
 *
 * @param  {Object} props Properties to use for the user.
 *
 * @return {Object}       An object to build the user from.
 */
const data = (props = {}) => {
	const defaultProps = {
		userkey: 'superrandomandsupersecurekey',
		ip: '10.10.10.10',
	};

	return Object.assign({}, defaultProps, props);
};

/**
 * Generates a session instance from the properties provided.
 *
 * @param  {Object} props Properties to use for the session.
 *
 * @return {Object}       A session instance
 */
export default async function (props = {}) {
	return db.session.create(data(props));
}