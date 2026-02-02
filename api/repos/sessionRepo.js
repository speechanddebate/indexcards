import db from '../data/db.js';
import crypto from 'crypto';
import * as personMapper from './mappers/personMapper.js';
import { toDomain, toPersistence } from './mappers/sessionMapper.js';

function buildSessionQuery(opts = {}) {
	return {
		where: {},
		attributes: undefined,
		include: [],
	};
}

async function findByUserKey(key) {

	const s = await db.session.findOne({
		where: { userkey: key },
		include: [
			{ model: db.person, as: 'person_person' },
			{ model: db.person, as: 'su_person' },
		],
	});

	if (!s) return null;

	return {
		...toDomain(s),
		person : personMapper.toDomain(s.person_person),
		su     : personMapper.toDomain(s.su_person),
	};
}
async function getSession(id, opts = {}) {
	if (!id) throw new Error('getSession: id is required');
	const query = buildSessionQuery(opts);
	query.where = { id, ...query.where };
	const dbRow = await db.session.findOne(query);
	if (!dbRow) return null;
	return toDomain(dbRow);
}
async function createSession(session){
	const userkey = crypto.randomBytes(32).toString('hex');
	const created = await db.session.create({
		...toPersistence(session),
		userkey: userkey,
	});
	return { id: created.id, userkey  };
}
/**
 * Deletes a session if it exists by its ID.
 *
 * @param {number} sessionId - The ID of the session to delete.
 * @returns {Promise<number>} The number of rows deleted.
 * @throws {TypeError} If sessionId is not a number.
 */
async function deleteSession(sessionId) {
	if (sessionId == null) return 0;
	if (typeof sessionId !== 'number') throw new TypeError();

	return db.session.destroy({ where: { id: sessionId } });
}

// export the  data functions NOT the mappers
export default {
	findByUserKey,
	getSession,
	createSession,
	deleteSession,
};
