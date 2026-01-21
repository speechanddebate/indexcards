import db from '../data/db.js';
/* eslint-disable-next-line import/no-unresolved */
import { verify } from 'unixcrypt';
import { toDomain } from './mappers/personMapper.js';
import { withSettingsInclude } from './utils/settings.js';

export async function getPerson(personId, opts = {}) {
	const dbRow = await db.person.findByPk(personId, {
		include: [
			...withSettingsInclude({
				model: db.personSetting,
				as: 'person_settings',
				settings: opts.settings,
			}),
		],
	});

	if (!dbRow) return null;

	return toDomain(dbRow);
}

async function getPersonByApiKey(personId,apiKey) {
	return await db.person.findOne({
		where: { id: personId },
		include: [
			{
				model : db.personSetting,
				as    : 'person_settings',
				where: {
					tag   : 'api_key',
					value : apiKey,
				},
				required: true,
			},
		],
	});
}
async function hasAreaAccess(personId, area) {
	const authTag = `api_auth_${area}`;
	const setting = await db.personSetting.findOne({
		where: {
			person: personId,
			tag: authTag,
		},
	});

	return setting !== null;
}
async function getPersonByUsername(username){
	const person = await db.person.findOne({
		where: { email: username },
	});
	return toDomain(person);
}
/**
 *  verify a username and password
 * @returns a person object if the credentials are valid, otherwise null
 */
export async function verifyPassword(username, password){
	const person = await db.person.findOne({
		where: { email: username },
	});
	if(!person || !person.password){
		return null;
	}
	const ok = verify(password, person.password);
	if (!ok) {
		return null;
	}
	return toDomain(person);
}

// export the  data functions NOT the mappers
export default {
	getPerson,
	getPersonByApiKey,
	hasAreaAccess,
	getPersonByUsername,
};
