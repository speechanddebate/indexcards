import db from '../data/db.js';
import { FIELD_MAP,toDomain,toPersistence } from './mappers/personMapper.js';
import { withSettingsInclude, saveSettings } from './utils/settings.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { chapterJudgeInclude } from './chapterJudge.js';

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

	// Exclude banned persons
	if (opts.excludeBanned) {
		if (!query.where[db.Sequelize.Op.and]) {
			query.where[db.Sequelize.Op.and] = [];
		}
		query.where[db.Sequelize.Op.and].push(
			db.sequelize.where(
				db.sequelize.literal(`NOT EXISTS (
					SELECT 1 FROM person_setting banned
					WHERE banned.person = person.id
					AND banned.tag = 'banned'
				)`),
				db.Sequelize.Op.eq,
				db.sequelize.literal('1')
			)
		);
	}

	// Exclude persons with unconfirmed emails
	if (opts.excludeUnconfirmedEmail) {
		if (!query.where[db.Sequelize.Op.and]) {
			query.where[db.Sequelize.Op.and] = [];
		}
		query.where[db.Sequelize.Op.and].push(
			db.sequelize.where(
				db.sequelize.literal(`NOT EXISTS (
					SELECT 1 FROM person_setting email_unconfirmed
					WHERE email_unconfirmed.person = person.id
					AND email_unconfirmed.tag = 'email_unconfirmed'
					AND email_unconfirmed.value = '1'
				)`),
				db.Sequelize.Op.eq,
				db.sequelize.literal('1')
			)
		);
	}

	// Require a person to have a valid paradigm setting, and have been updated since the last paradigm review cutoff
	if (opts.hasValidParadigm) {
		const now = opts.now || new Date();
		const reviewSettings = await db.tabroomSetting.findAll({
			where: {
				tag: {
					[db.Sequelize.Op.in]: ['paradigm_review_cutoff', 'paradigm_review_start'],
				},
			},
		});
		const reviewCutoff = reviewSettings.find(setting => setting.tag === 'paradigm_review_cutoff');
		const reviewStart = reviewSettings.find(setting => setting.tag === 'paradigm_review_start');
		const reviewClause = (reviewCutoff?.value_date
			&& reviewStart?.value_date
			&& reviewCutoff.value_date < now)
			? ` AND paradigm.timestamp > ${db.sequelize.escape(reviewStart.value_date)}`
			: '';
		if (!query.where[db.Sequelize.Op.and]) {
			query.where[db.Sequelize.Op.and] = [];
		}
		query.where[db.Sequelize.Op.and].push(
			db.sequelize.where(
				db.sequelize.literal(`EXISTS (
					SELECT 1 FROM person_setting paradigm
					WHERE paradigm.person = person.id
					AND paradigm.tag = 'paradigm'
					${reviewClause}
				)`),
				db.Sequelize.Op.eq,
				db.sequelize.literal('1')
			)
		);
	}

	query.include.push(
		...withSettingsInclude({
			model: db.personSetting,
			as: 'person_settings',
			settings: opts.settings,
		})
	);

	// Add chapter join when requested
	if (opts.include?.chapterJudges) {
		query.include.push(chapterJudgeInclude(opts.include.chapterJudges));
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

	const query = await buildPersonQuery(opts);
	query.order = [['last', 'ASC'], ['first', 'ASC']];
	query.attributes = [
		'id',
		'first',
		'last',
	];

	// Build name search conditions that handle multi-word search
	// "john smith", "smith john", "john", "smith" should all match person with firstName=john, lastName=smith
	if (words.length > 0) {
		const nameConditions = words.map(word => ({
			[db.Sequelize.Op.or]: [
				{ first: { [db.Sequelize.Op.like]: `${word}%` } },
				{ last: { [db.Sequelize.Op.like]: `${word}%` } },
			],
		}));

		query.where = {
			...query.where,
			[db.Sequelize.Op.and]: nameConditions,
		};
	}

	query.limit = opts.limit || 75;
	query.subQuery = false;

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
