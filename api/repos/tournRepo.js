import db from '../data/db.js';
import  fileRepo  from './fileRepo.js';
import webpageRepo  from './webpageRepo.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/tournMapper.js';
import { saveSettings, withSettingsInclude } from './utils/settings.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildTournQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
		order: [['start', 'desc']],
	};
	if (!opts.unpublished){
		query.where.hidden = 0;
	}
	query.include.push(
		...withSettingsInclude({
			model: db.tournSetting,
			as: 'tourn_settings',
			settings: opts.settings,
		})
	);
	return query;
}
export function tournInclude(opts = {}) {
	return {
		model: db.tourn,
		as: 'tourns',
		...buildTournQuery(opts),
	};
}

/**
 * Fetch a single tournament by ID or webname.
 *
 * @param {number|string} tournId
 *   Tournament ID (numeric) or webname (string).
 *
 * @param {Object} [opts] - Options for fetching the tournament.
 * @returns {Promise<Object|null>}
 *   The tournament domain object, or null if not found.
 */
export async function getTourn(tournId,opts = {}) {
	const query = buildTournQuery(opts);

	// ---- ID vs webname ----
	if (typeof tournId === 'number' || !isNaN(parseInt(tournId))) {
		query.where.id = parseInt(tournId, 10);
	} else {
		query.where.webname = tournId.replace(/\W/g, '');
	}

	const tourn = await db.tourn.findOne(query);

	return toDomain(tourn);
}
export async function createTourn(tourn) {
	const created = await db.tourn.create(
		toPersistence(tourn)
	);

	await saveSettings({
		model: db.tournSetting,
		settings: tourn.settings,
		ownerKey: 'tourn',
		ownerId: created.id,
	});
	return created.id;
}

/**
 * Get files scoped to a tournament.
 *
 * @param {number} tournId - Tournament ID to scope files to
 * @param {Object} [opts] - Optional query options
 * @param {boolean} [opts.includeUnpublished=false] - Include unpublished files
 * @returns {Promise<Array<Object>>} List of files
 */
export async function getFiles(tournId, opts = {}) {
	return await fileRepo.getFiles({ tournId: tournId }, opts);
};
export async function getSchedule(tournId){
	const schedule = await db.sequelize.query(`
			select
				round.id, round.name, round.label, round.type, round.start_time startTime,
				event.id eventId, event.abbr eventAbbr,
				round.published,
				timeslot.id timeslotId, timeslot.start timeslotStart
			from (round, event, timeslot)
			where 1=1
				and event.tourn = :tournId
				and event.id = round.event
				and round.timeslot = timeslot.id
				and event.type != 'attendee'
			order by event.abbr, round.name, timeslot.start
		`, {
		replacements: { tournId },
		type: db.Sequelize.QueryTypes.SELECT,
	});
	return schedule;
};
/**
 * Get webpages scoped to a tournament.
 *
 * @param {number} tournId - Tournament ID to scope webpages to
 * @param {Object} [opts] - Optional query options
 * @param {boolean} [opts.includeUnpublished=false] - Include unpublished webpages
 * @returns {Promise<Array<Object>>} List of webpages
 */
export async function getPages(tournId, opts = {}) {
	const webpages = await webpageRepo.getWebpages({
		...opts,
		scope: {
			...opts.scope,
			tournId,
		},
	});
	return webpages;
};
export async function getContacts(tournId) {
	return await db.sequelize.query(`
		select
			person.id, person.first, person.middle, person.last, person.email

		from (person, permission)

		where 1=1
			and permission.tourn  = :tournId
			and permission.tag    = 'contact'
			and permission.person = person.id
	`, {
		replacements : { tournId },
		type         : db.sequelize.QueryTypes.SELECT,
	});
};

export default {
	getTourn,
	createTourn,
	getFiles,
	getSchedule,
	getPages,
	getContacts,
};