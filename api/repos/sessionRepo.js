import db from '../data/db.js';
import crypto from 'crypto';
import { FIELD_MAP,toDomain, toPersistence } from './mappers/sessionMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { personInclude } from './personRepo.js';

function buildSessionQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};
	if(opts.include?.person){
		query.include.push({
			...personInclude(opts.include.person),
			as: 'person_person',
			required: false,
		});
	}
	if(opts.include?.su){
		query.include.push({
			...personInclude(opts.include.su),
			as: 'su_person',
			required: false,
		});
	}
	return query;
}

async function findByUserKey(key, opts = {}) {
	const query = buildSessionQuery(opts);
	query.where.userkey = key;
	const s = await db.session.findOne(query);
	return toDomain(s);
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
