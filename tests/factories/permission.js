import db from '../../api/data/db.js';

/**
 * Generate an object which contains attributes needed
 * to successfully create a permission instance.
 *
 * @param  {Object} props Properties to use for the permission.
 *
 * @return {Object}       An object to build the permission from.
 */
const data = (props = {}) => {
	const defaultProps = {

	};

	return Object.assign({}, defaultProps, props);
};

/**
 * Generates a permission instance from the properties provided.
 *
 * @param  {Object} props Properties to use for the permission.
 *
 * @return {Object}       A permission instance
 */
export default async function (props = {}) {
	return db.permission.create(data(props));
}