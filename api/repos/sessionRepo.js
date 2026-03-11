import db from '../data/db.js';
import crypto from 'crypto';
/* eslint-disable-next-line import/no-unresolved */
import { encrypt, verify } from 'unixcrypt';
import { FIELD_MAP,toDomain, toPersistence } from './mappers/sessionMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { personInclude } from './personRepo.js';
import { config } from '../../config/config.js';

async function buildSessionQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};
	if(opts.include?.person){
		const personInc = await personInclude(opts.include.person);
		query.include.push({
			...personInc,
			as: 'person_person',
			required: false,
		});
	}
	if(opts.include?.su){
		const suInc = await personInclude(opts.include.su);
		query.include.push({
			...suInc,
			as: 'su_person',
			required: false,
		});
	}
	return query;
}

async function findByUserKey(key, opts = {}) {
	const query = await buildSessionQuery(opts);
	query.where.userkey = key;
	const s = await db.session.findOne(query);

	// Check for validity
	const verified = verify(`${s.id}${config.SESSION_SHARED}`, s.userkey);
	console.log(`Verify status ${verified} with ${s.id}${config.SESSION_SHARED} and salt key ${s.userkey}`);

	if (verified) return toDomain(s);
}

async function getSession(id, opts = {}) {
	if (!id) throw new Error('getSession: id is required');
	const query = await buildSessionQuery(opts);
	query.where = { id, ...query.where };
	const dbRow = await db.session.findOne(query);
	if (!dbRow) return null;
	return toDomain(dbRow);
}

async function createSession(session){
	const userSalt = crypto.randomBytes(8).toString('hex');
	const created = await db.session.create({
		...toPersistence(session),
	});

	// I don't defend this but it preserves backwards compat -- CLP
	created.set({
		userkey: encrypt(`${created.id}${config.SESSION_SHARED}`, '$6$'+userSalt),
	});
	await created.save();
	return { id: created.id, userkey: created.userkey  };
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
