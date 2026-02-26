import db from '../data/db.js';
import { fileInclude }  from './fileRepo.js';
import { webpageInclude }  from './webpageRepo.js';
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
	if(opts.include?.webpages) {
		query.include.push({
			...webpageInclude(opts.include.webpages),
			as: 'webpages',
			required: false,
		});
	}
	if(opts.include?.files){
		query.include.push({
			...fileInclude(opts.include.files),
			as: 'files',
			required: false,
		});
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
async function getTourn(tournId,opts = {}) {
	const query = buildTournQuery(opts);

	// ---- ID vs webname ----
	if (typeof tournId === 'number' || !isNaN(parseInt(tournId))) {
		query.where.id = parseInt(tournId);
	} else {
		query.where.webname = tournId;
	}

	const tourn = await db.tourn.findOne(query);

	return toDomain(tourn);
}
async function createTourn(tourn) {
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

async function updateTourn(tournId, updates) {
	if (!tournId) throw new Error('updateTourn: tournId is required');
	if (!updates) throw new Error('updateTourn: updates are required');

	const [rows] = await db.tourn.update(
		toPersistence(updates),
		{
			where: { id: tournId },
		}
	);

	let updated = rows > 0;
	let settingsUpdated = false;
	if (updates.settings) {
		settingsUpdated = await saveSettings({
			model: db.tournSetting,
			settings: updates.settings,
			ownerKey: 'tourn',
			ownerId: tournId,
		});
	}
	updated = updated || settingsUpdated.length > 0;
	return updated;
}
async function deleteTourn(tournId) {
	if (!tournId) throw new Error('deleteTourn: tournId is required');
	const rows = await db.tourn.destroy({
		where: { id: tournId },
	});
	return rows > 0;
}

async function addSite(tournId, siteId) {
	if (!tournId) throw new Error('addSite: tournId is required');
	if (!siteId) throw new Error('addSite: siteId is required');
	await db.tournSite.create({
		tourn: tournId,
		site: siteId,
	});
	return true;
}
export async function getSchedule(tournId){
	const schedule = await db.sequelize.query(`
			select
				round.id, round.name, round.label, round.type, round.start_time startTime,
				event.id eventId, event.abbr eventAbbr, event.type eventType,
				round.published, round.post_primary,
				timeslot.id timeslotId,
					timeslot.start timeslotStart, timeslot.end timeslotEnd
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

	return schedule.map( (round) => {
		return {
			id          : round.id,
			type        : round.type,
			name        : round.name,
			label       : round.label,
			published   : round.published,
			postPrimary : round.post_primary,
			startTime   : round.startTime,
			Event: {
				id   : round.eventId,
				name : round.eventName,
				abbr : round.eventAbbr,
				type : round.eventType,
			},
			Timeslot  : {
				id    : round.timeslotId,
				start : round.timeslotStart,
				end   : round.timeslotEnd,
			},
		};
	});
};
/**
 * Get webpages scoped to a tournament.
 *
 * @param {number} tournId - Tournament ID to scope webpages to
 * @param {Object} [opts] - Optional query options
 * @param {boolean} [opts.unpublished=false] - Include unpublished webpages
 * @returns {Promise<Array<Object>>} List of webpages
 */

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
	updateTourn,
	deleteTourn,
	addSite,
	getSchedule,
	getContacts,
};