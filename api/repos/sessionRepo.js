import db from '../data/db.js';
import { mapPerson } from './personRepo.js';
import { safeParseJson } from '../helpers/json.js';

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
		person: mapPerson(s.person_person),
		su: mapPerson(s.su_person),
	};
}

export function mapSession(sessionInstance) {
	if (!sessionInstance) return null;

	return {
		id: sessionInstance.id,
		userkey: sessionInstance.userkey,
		siteAdmin: sessionInstance.siteAdmin,
		defaults: sessionInstance.defaults ? safeParseJson(sessionInstance.defaults) : null,
		agentData: sessionInstance.agent_data ? safeParseJson(sessionInstance.agent_data) : null,
	};
}

// export the  data functions NOT the mappers
export default {
	findByUserKey,
};