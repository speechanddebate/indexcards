import db from '../data/db.js';
import { FIELD_MAP,toDomain,toPersistence } from './mappers/personMapper.js';
import { withSettingsInclude, saveSettings } from './utils/settings.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildPersonQuery(opts = {}) {

	// Exclude password by default unless opts.includePassword is true
	let attributes = resolveAttributesFromFields(opts.fields, FIELD_MAP);
	if (!opts.includePassword) {
		if (!attributes) {
			attributes = { exclude: ['password'] };
		} else if (attributes.exclude && !attributes.exclude.includes('password')) {
			attributes.exclude.push('password');
		}
	}
	const query = {
		where: {},
		attributes,
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
	if (!personId) throw new Error('getPerson: personId is required');
	const query = buildPersonQuery(opts);
	query.where = { ...query.where, id: personId };
	const dbRow = await db.person.findOne(query);

	if (!dbRow) return null;

	return toDomain(dbRow);
}
async function getPersonByUsername(username, opts = {}) {
	const query = buildPersonQuery(opts);
	query.where = { ...query.where, email: username };
	const dbRow = await db.person.findOne(query);
	return toDomain(dbRow);
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
	hasAreaAccess,
	getPersonByUsername,
	createPerson,
};
