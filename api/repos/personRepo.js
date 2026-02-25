
import db from '../data/db.js';
import { FIELD_MAP,toDomain,toPersistence } from './mappers/personMapper.js';
import { withSettingsInclude, saveSettings } from './utils/settings.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { chapterJudgeInclude } from './chapterJudge.js';
import { judgeInclude } from './judgeRepo.js';

async function buildPersonQuery(opts = {}) {

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

	// Build tag filters for settings include
	let settingsTags = [];
	if (opts.settings === true) {
		settingsTags = true;
	} else if (Array.isArray(opts.settings)) {
		settingsTags = [...opts.settings];
	}

	const settingsInclude = withSettingsInclude({
		model: db.personSetting,
		as: 'person_settings',
		settings: settingsTags,
	})[0];

	if (opts.excludeBanned) {
		query.where[db.Sequelize.Op.and] = query.where[db.Sequelize.Op.and] || [];
		query.where[db.Sequelize.Op.and].push(
			db.Sequelize.literal(`NOT EXISTS (SELECT 1 FROM person_setting ps WHERE ps.person = person.id AND ps.tag = 'banned')`)
		);
	}

	if (opts.excludeUnconfirmedEmail) {
		query.where[db.Sequelize.Op.and] = query.where[db.Sequelize.Op.and] || [];
		query.where[db.Sequelize.Op.and].push(
			db.Sequelize.literal(`NOT EXISTS (SELECT 1 FROM person_setting ps WHERE ps.person = person.id AND ps.tag = 'email_unconfirmed')`)
		);
	}
	if(opts.hasValidParadigm) {
		query.where[db.Sequelize.Op.and] = query.where[db.Sequelize.Op.and] || [];
		query.where[db.Sequelize.Op.and].push(
			db.Sequelize.literal(`EXISTS (SELECT 1 FROM person_setting ps WHERE ps.person = person.id AND ps.tag = 'paradigm')`)
		);
	}
	if(opts.hasJudged) {
		query.where[db.Sequelize.Op.and] = query.where[db.Sequelize.Op.and] || [];
		query.where[db.Sequelize.Op.and].push(
			db.Sequelize.literal(`EXISTS (SELECT 1 FROM judge j WHERE j.person = person.id)`)
		);
	}

	if (settingsInclude) {
		query.include.push(settingsInclude);
	}

	// Add chapter join when requested
	if (opts.include?.chapterJudges) {
		query.include.push(chapterJudgeInclude(opts.include.chapterJudges));
	}
	if (opts.include?.judges){
		query.include.push({
			...judgeInclude(opts.include.judges),
			as: 'judges',
			required: false,
		});
	}

	if (Number.isInteger(opts.limit)) {
		query.limit = opts.limit;
	}

	if (Number.isInteger(opts.offset)) {
		query.offset = opts.offset;
	}

	return query;
}

export async function personInclude(opts = {}) {
	return {
		model: db.person,
		as: 'persons',
		...(await buildPersonQuery(opts)),
	};
}

export async function getPerson(personId, opts = {}) {
	if (!personId) throw new Error('getPerson: personId is required');
	const query = await buildPersonQuery(opts);
	query.where = { ...query.where, id: personId };
	const dbRow = await db.person.findOne(query);

	if (!dbRow) return null;

	return toDomain(dbRow);
}

/**
 * Search for persons with flexible filters and includes.
 * @param {string} searchTerm - Search term to match against first or last name (prefix match)
 * @param {Object} opts - Additional options (limit, filters, includes)
 * @returns {Array} [{id, firstName, lastName, chapters}, ...]
 */
async function personSearch(searchTerm = '', opts = {}) {
	// Sanitize and split search term into words
	const sanitize = (term) => {
		if (!term) return '';
		return term.replace(/[^a-zA-Z0-9\-\s]/g, '').trim();
	};

	const cleanTerm = sanitize(searchTerm);
	const words = cleanTerm.split(/\s+/).filter(w => w.length > 0);

	if (words.length === 0) {
		return [];
	}

	// Use buildPersonQuery for all filters and includes
	const query = await buildPersonQuery(opts);

	// Add name search to where clause
	query.where = query.where || {};
	query.where[db.Sequelize.Op.and] = query.where[db.Sequelize.Op.and] || [];
	for (const word of words) {
		query.where[db.Sequelize.Op.and].push({
			[db.Sequelize.Op.or]: [
				{ first: { [db.Sequelize.Op.like]: `${word}%` } },
				{ last: { [db.Sequelize.Op.like]: `${word}%` } },
			],
		});
	}

	query.order = [['last', 'ASC'], ['first', 'ASC']];
	//query.subQuery = false;
	//query.distinct = true;

	const results = await db.person.findAll(query);
	return results.map(toDomain);
}
async function getPersonByUsername(username, opts = {}) {
	const query = await buildPersonQuery(opts);
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
	personSearch,
	getPersonByUsername,
	createPerson,
};
