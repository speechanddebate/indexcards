import db from '../data/db.js';
export function emailInclude(opts = {}) {
	return {
		model: db.email,
		as: 'emails',
	};
}