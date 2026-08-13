import db from '../data/db.js';
import { fileInclude }  from './fileRepo.js';
import { webpageInclude }  from './webpageRepo.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/tournMapper.js';
import { saveSettings, withSettingsInclude } from './utils/settings.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { eventInclude } from './eventRepo.js';
import { literal, Op } from 'sequelize';

function buildTournQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
		order: [['start', 'desc']],
	};
	if(opts.limit) {
		query.limit = opts.limit;
	}
	if(opts.offset) {
		query.offset = opts.offset;
	}
	if (!opts.unpublished){
		query.where.hidden = 0;
	}
	if (opts.hasPublishedResults) {
		query.where = {
			...query.where,
			[Op.or]: [
				literal(`EXISTS (
					SELECT event.id
					FROM event, round
					WHERE event.tourn = tourn.id
					  AND event.id = round.event
					  AND round.post_primary > 2
				)`),
				literal(`EXISTS (
					SELECT result_set.id
					FROM result_set
					WHERE result_set.tourn = tourn.id
					  AND result_set.published = 1
				)`),
			],
		};
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
	if(opts.include?.events) {
		query.include.push({
			...eventInclude(opts.include.events),
			as: 'events',
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
async function getTourns(scope={}, opts = {}) {
	const query = buildTournQuery(opts);
	if (scope.circuit) {
		// Tourn → tournCircuit → circuit join
		query.include.push({
			model: db.tournCircuit,
			as: 'tourn_circuits',
			attributes: [],
			required: true,
			where: { circuit: scope.circuit, approved: 1 },
		});
	}
	if(scope.startAfter){
		query.where.start = {
			[db.Sequelize.Op.gt]: scope.startAfter,
		};
	}
	if(scope.startBefore){
		query.where.start = {
			...query.where.start,
			[db.Sequelize.Op.lt]: scope.startBefore,
		};
	}
	const tourns = await db.tourn.findAll(query,{raw: true});
	return tourns;
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
			model    : db.tournSetting,
			settings : updates.settings,
			ownerKey : 'tourn',
			ownerId  : tournId,
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
				event.nsda_category nsdaCategory,
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
				id           : round.eventId,
				name         : round.eventName,
				abbr         : round.eventAbbr,
				type         : round.eventType,
				nsdaCategory : round.nsdaCategory,
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

async function getPersonTourns(personId, opts = {}) {
	const conditions = [
		't.hidden != 1',
	];

	const replacements = {
		personId,
	};

	if (opts.endAfter) {
		conditions.push('t.end >= :endAfter');
		replacements.endAfter = opts.endAfter;
	}

	const data = await db.sequelize.query(`
		SELECT t.*
		FROM tourn t

		WHERE ${conditions.join('\n\t\tAND ')}
		AND (
			EXISTS (
				SELECT 1
				FROM student
				JOIN entry_student
					ON entry_student.student = student.id
				JOIN entry
					ON entry.id = entry_student.entry
				JOIN event e
					ON e.id = entry.event
				WHERE student.person = :personId
				AND student.retired != 1
				AND e.tourn = t.id
			)
			OR EXISTS (
				SELECT 1
				FROM judge
				JOIN category
					ON category.id = judge.category
				WHERE judge.person = :personId
				AND category.tourn = t.id
			)
			OR EXISTS (
				SELECT 1
				FROM permission
				JOIN chapter
					ON chapter.id = permission.chapter
				JOIN school
					ON school.chapter = chapter.id
				WHERE permission.person = :personId
				AND school.tourn = t.id
			)
		)

		ORDER BY t.start;
	`, {
		replacements,
		type: db.Sequelize.QueryTypes.SELECT,
	});

	return data;
}

async function getPersonTournSummary(person,tourn){
	const data = await db.sequelize.query(`
	SELECT
		t.id AS tourn_id,

		j.judge_id,
		j.category_id,
		j.category_name,
		j.livedoc_url,
		j.livedoc_caption,

		e.entry_id,

		(coach.school_id is not null) as is_coach,
		coach.school_id,
		coach.school_name


	FROM tourn t

	LEFT JOIN (
		SELECT
			j.id AS judge_id,
			c.tourn AS tourn_id,
			c.id AS category_id,
			c.name AS category_name,
			(
				SELECT cs.value_text
				FROM category_setting cs
				WHERE cs.category = c.id
				  AND cs.tag = 'livedoc_url'
				LIMIT 1
			) AS livedoc_url,
			(
				SELECT cs.value
				FROM category_setting cs
				WHERE cs.category = c.id
				  AND cs.tag = 'livedoc_caption'
				LIMIT 1
			) AS livedoc_caption
		FROM judge j
		JOIN category c
			ON c.id = j.category
		WHERE j.person = :person
	) j
		ON j.tourn_id = t.id

	LEFT JOIN (
		SELECT
			e.id AS entry_id,
			ev.tourn AS tourn_id
		FROM student st
		JOIN entry_student es
			ON es.student = st.id
		JOIN entry e
			ON e.id = es.entry
		JOIN event ev
			ON ev.id = e.event
		WHERE st.person = :person
		  AND st.retired != 1
	) e
		ON e.tourn_id = t.id

	LEFT JOIN (
		SELECT
			s.tourn AS tourn_id,
			s.id AS school_id,
			s.name AS school_name
		FROM permission p
		JOIN chapter ch
			ON ch.id = p.chapter
		JOIN school s
			ON s.chapter = ch.id
		WHERE p.person = :person
	) coach
		ON coach.tourn_id = t.id

	WHERE t.id = :tourn
	`,{
		replacements: {
			person,
			tourn,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});
	if (data.length === 0)
		return null;

	const result = {
		tourn_id: data[0].tourn_id,
		judges: [],
		entries: [],
		coaches: [],
	};

	const judges = new Map();
	const entries = new Map();
	const coaches = new Map();

	for (const row of data) {
		if (row.judge_id != null && !judges.has(row.judge_id)) {
			judges.set(row.judge_id, {
				id: row.judge_id,
				category_id: row.category_id,
				category_name: row.category_name,
				livedoc_url: row.livedoc_url,
				livedoc_caption: row.livedoc_caption,
			});
		}

		if (row.entry_id != null && !entries.has(row.entry_id)) {
			entries.set(row.entry_id, {
				id: row.entry_id,
			});
		}

		if (row.school_id != null && !coaches.has(row.school_id)) {
			coaches.set(row.school_id, {
				id: row.school_id,
				name: row.school_name,
			});
		}
	}

	result.judges = [...judges.values()];
	result.entries = [...entries.values()];
	result.coaches = [...coaches.values()];

	return result;
}
export default {
	getTourn,
	getTourns,
	createTourn,
	updateTourn,
	deleteTourn,
	addSite,
	getSchedule,
	getContacts,
	getPersonTourns,
	getPersonTournSummary,
};
