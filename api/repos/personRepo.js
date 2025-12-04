import db from '../data/db.js';
import getSettings from '../helpers/settings.js';
async function getPersonById(personId, options = {settings: false} ) {
	//call findByPk with settings if requested
	var p = await db.person.findByPk(
		personId,
        options.settings ? { include: [{ model: db.personSetting, as: 'person_settings'}] } : {}
	);

	if (!p) return null;
	return {
		...mapPerson(p),
		settings: options.settings ? p.person_settings : undefined,
	};
}

//simple wrapper to get person by id including settings
async function getPersonByIdWithSettings(personId) {
	return getPersonById(personId, {settings: true});
}

async function getPersonSettings(personId, options = {} ) {
	return getSettings('person', personId,options);
}

export function mapPerson(personInstance) {
	if (!personInstance) return null;

	return {
		id: personInstance.id,
		email: personInstance.email,
		firstName: personInstance.first_name,
		middleName: personInstance.middle_name,
		lastName: personInstance.last_name,
		state: personInstance.state,
		country: personInstance.country,
		tz: personInstance.tz,
		nada: personInstance.nsda,
		phone: personInstance.phone,
		gender: personInstance.gender,
		pronoun: personInstance.pronoun,
		no_email: personInstance.no_email,
		siteAdmin: personInstance.site_admin,
		accesses: personInstance.accesses,
		lastAccess: personInstance.last_access,
		passTimestamp: personInstance.pass_timestamp,
		timestamp: personInstance.timestamp,
	};
}

// export the  data functions NOT the mappers
export default {
	getPersonById,
	getPersonByIdWithSettings,
	getPersonSettings,
};