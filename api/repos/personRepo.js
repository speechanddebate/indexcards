import db from '../data/db.js';
/* eslint-disable-next-line import/no-unresolved */
import { verify } from 'unixcrypt';
import { FIELD_MAP,toDomain,toPersistence } from './mappers/personMapper.js';
import { withSettingsInclude, saveSettings } from './utils/settings.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildPersonQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	query.include.push(
		...withSettingsInclude({
			model: db.personSetting,
			as: 'person_settings',
			settings: opts.settings,
		})
	);

	return query;
}

export function personInclude(opts = {}) {
	return {
		model: db.person,
		as: 'persons',
		...buildPersonQuery(opts),
	};
}

export async function getPerson(personId, opts = {}) {
	const query = buildPersonQuery(opts);
	query.where = { ...query.where, id: personId };
	const dbRow = await db.person.findOne(query);

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

async function createPerson(personData = {}){
	const dbRow = await db.person.create(toPersistence(personData));

	await saveSettings({
		model: db.personSetting,
		settings: personData.settings,
		ownerKey: 'person',
		ownerId: dbRow.id,
	});
	return dbRow.id;
}

// export the  data functions NOT the mappers
export default {
	getPerson,
	getPersonByApiKey,
	hasAreaAccess,
	getPersonByUsername,
	createPerson,
};
