import db from '../data/db.js';
import { baseRepo } from './baseRepo.js';
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
				model: db.personSetting,
				as: 'person_settings',
				where: {
					tag: 'api_key',
					value: apiKey,
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

//eventually get rid of this and just use the with settings version but auth needs it now
async function getPersonSettings(personId, options = {} ) {
	return getSettings('person', personId,options);
}

export function mapPerson(personInstance) {
	if (!personInstance) return null;

	return {
		id            : personInstance.id,
		email         : personInstance.email,
		first         : personInstance.first,
		middle        : personInstance.middle,
		last          : personInstance.last,
		state         : personInstance.state,
		country       : personInstance.country,
		tz            : personInstance.tz,
		nada          : personInstance.nsda,
		phone         : personInstance.phone,
		gender        : personInstance.gender,
		pronoun       : personInstance.pronoun,
		no_email      : personInstance.no_email,
		siteAdmin     : personInstance.site_admin,
		accesses      : personInstance.accesses,
		lastAccess    : personInstance.last_access,
		passTimestamp : personInstance.pass_timestamp,
		timestamp     : personInstance.timestamp,
		settings: personInstance.person_settings ?
			flattenSettings(personInstance.person_settings) : undefined,
	};
}

// export the  data functions NOT the mappers
export default {
	...base,

	getPersonByApiKey,
	hasAreaAccess,
	getPersonByIdWithSettings,
	getPersonSettings,
};
