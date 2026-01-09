import db from '../data/db.js';
import { baseRepo } from './baseRepo.js';
import  fileRepo  from './fileRepo.js';
import webpageRepo  from './webpageRepo.js';
import { flattenSettings } from '../helpers/settings.js';

export async function getTourn(tournId, { unpublished = false } = {}) {
	const where = {};
	if (!unpublished) {
		where.hidden = 0;
	}

	if (typeof tournId === 'number' || !isNaN(parseInt(tournId))) {
		where.id = parseInt(tournId);
	} else {
		where.webname = tournId.replace(/\W/g, '');
	}

	const tourn = await db.tourn.findOne({
		where,
		order : [['start', 'desc']],
		limit : 1,
	});

	return  mapTourn(tourn);
};
/**
 * Get files scoped to a tournament.
 *
 * @param {number} tournId - Tournament ID to scope files to
 * @param {Object} [opts] - Optional query options
 * @param {boolean} [opts.includeUnpublished=false] - Include unpublished files
 * @returns {Promise<Array<Object>>} List of files
 */
export async function getFiles(tournId, opts = {}) {
	return await fileRepo.getFiles({
		...opts,
		scope: {
			...opts.scope,
			tournId,
		},
	});
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
function mapTourn(tournInstance) {
	if (!tournInstance) return null;
	return {
		id: tournInstance.id,
		name: tournInstance.name,
		city: tournInstance.city,
		state: tournInstance.state,
		country: tournInstance.country,
		tz: tournInstance.tz,
		webname: tournInstance.webname,
		hidden: tournInstance.hidden,
		timestamp: tournInstance.timestamp,
		start: tournInstance.start,
		end: tournInstance.end,
		regStart: tournInstance.reg_start,
		regEnd: tournInstance.reg_end,
		settings: tournInstance.tourn_settings ?
                  flattenSettings(tournInstance.tourn_settings) : undefined,
	};
}

export default {
	...baseRepo(db.tourn, mapTourn),
	getTourn,
	getFiles,
	getSchedule,
	getPages,
	getContacts,
};