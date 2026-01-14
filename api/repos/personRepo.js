import db from '../data/db.js';
import { baseRepo } from './baseRepo.js';
/* eslint-disable-next-line import/no-unresolved */
import { verify } from 'unixcrypt';
import getSettings, { flattenSettings } from '../helpers/settings.js';

const base = baseRepo(db.person, mapPerson);

//simple wrapper to get person by id including settings
async function getPersonByIdWithSettings(personId) {
	return base.getById(personId, {settings: true});
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
	return mapPerson(person);
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
	return mapPerson(person);
}

// Eventually get rid of this and just use the with settings version but auth
// needs it now

async function getPersonSettings(personId, options = {} ) {
	return getSettings('person', personId,options);
}

export function mapPerson(person) {
	if (!person) return null;

	return {
		id            : person.id,
		email         : person.email,
		first         : person.first,
		middle        : person.middle,
		last          : person.last,
		state         : person.state,
		country       : person.country,
		tz            : person.tz,
		nada          : person.nsda,
		phone         : person.phone,
		gender        : person.gender,
		pronoun       : person.pronoun,
		no_email      : person.no_email,
		siteAdmin     : person.site_admin,
		accesses      : person.accesses,
		lastAccess    : person.last_access,
		passTimestamp : person.pass_timestamp,
		timestamp     : person.timestamp,
		settings: person.person_settings ?
			flattenSettings(person.person_settings) : undefined,
	};
}

// export the  data functions NOT the mappers
export default {
	...base,

	getPersonByApiKey,
	hasAreaAccess,
	getPersonByIdWithSettings,
	getPersonSettings,
	getPersonByUsername,
};
