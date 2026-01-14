import db from '../data/db.js';
import { mapPerson } from './personRepo.js';
import { safeParseJson } from '../helpers/json.js';
import { baseRepo } from './baseRepo.js';
import crypto from 'crypto';

const base = baseRepo(db.session, mapSession);

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
		...mapSession(s),
		person : mapPerson(s.person_person),
		su     : mapPerson(s.su_person),
	};
}

async function createSession({
	personId,
	ip,
	agentData,
}){

	const userkey = crypto.randomBytes(32).toString('hex');

	const session = await db.session.create({
		person: personId,
		userkey,
		ip,
		agent_data: agentData,
		last_access: new Date(),
	});

	var result =  mapSession(session);
	result.userkey = session.userkey ;//userkey only ever returned from a createSession
	return result;
}
async function deleteSession(sessionId){
	await db.session.destroy({
		where: {
			id: sessionId,
		},
	});
}

export function mapSession(session) {
	if (!session) return null;

	return {
		id        : session.id,
		defaults  : session.defaults ? safeParseJson(session.defaults)     : null,
		agentData : session.agent_data ? safeParseJson(session.agent_data) : null,
	};
}

// export the  data functions NOT the mappers
export default {
	...base,
	findByUserKey,
	createSession,
	deleteSession,
};
