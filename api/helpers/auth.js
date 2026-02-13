import db from '../data/db.js';
import { errorLogger } from './logger.js';

// export async function keyAuth(req, res, next) {
// 	let persons = [];
// 	const personId = req.user.id;
// 	/**
// 	 * if area is tourn and tournId is set, check for tournament level permissions
// 	 */
// 	if (req.params.area === 'tourn' && req.params.tournId) {

// 		persons = await db.sequelize.query(`
// 			select
// 				person.*,
// 				permission.tag tournTag
// 			from person, permission
// 			where 1=1
// 				and person.id        = :personId
// 				and person.id       = permission.person
// 				and permission.tourn = :tournId
// 				and permission.tag IN ('owner', 'tabber')
// 				and exists (
// 					select ps.id
// 						from person_setting ps
// 					where 1=1
// 						and ps.tag = 'api_key'
// 						and ps.person = person.id
// 						and ps.value = :key
// 				)
// 		`, {
// 			replacements: {
// 				personId,
// 				key,
// 				tournId: req.params.tournId,
// 			},
// 			type: db.Sequelize.QueryTypes.SELECT,
// 		});

// 	} else {
// 		if(personRepo.hasAreaAccess(personId, req.params.area)){
// 			person.add(await personRepo.getById(personId));
// 		}
// 	}

// 	if (persons.length < 1) {
// 		return 'No valid Authorization header found. Access denied.';
// 	}

// 	const person = persons.shift();

// 	if (person && person.id) {
// 		req.session = { person };
// 		if (person.apiTag) {
// 			req.session.settings = {
// 				[person.apiTag]: true,
// 			};
// 		}

// 		if (person.tournTag) {
// 			req.session.permissions = {
// 				[req.params.tournId] : person.tournTag,
// 			};
// 		}
// 		return req.session;
// 	}

// 	return 'No valid Authorization header found. Access denied.';
// };

export const tabAuth = async (req) => {

	if (!req.person || !req.person.id) {
		return req.session;
	}

	if (!req.session.perms || !req.session.perms?.tourn) {
		req.session.perms = {
			tourn    : {},
			event    : {},
			category : {},
		};
	}

	// User request must have access to the tournament.  Figure out how!
	const tournId = req.params.tournId;
	const typeId  = req.params.typeId;
	let subType   = req.params.subType;

	let tourn = {};

	try {
		tourn = await db.summon(db.tourn, tournId);
	} catch (err) {
		return (err);
	}

	let perms = {};

	if (req.person.siteAdmin) {

		req.session.perms.tourn[tournId] = 'owner';
		req.session.tourn = tourn;
		perms = req.session.perms;

	} else {

		perms = await tournPerms(tournId, req.session.personId);

		if (!perms || !perms.tourn[tournId]) {
			return req.session;
		}

		req.session.tourn = tourn;
		req.session.perms.tourn[tournId] = perms.tourn[tournId];
	}

	Object.keys(perms.event).forEach( eventId => {
		req.session.perms.event[eventId] = perms.event[eventId];
	});

	Object.keys(perms.category).forEach( categoryId => {
		req.session.perms.category[categoryId] = perms.category[categoryId];
	});

	// Top level tournament access.  Things for checkers etc will go under
	// /all, where fine grained permissions are managed locally.

	const permittedSubTypes = [
		'section',
		'panel',
		'round',
		'event',
		'category',
		'timeslot',
		'judge',
		'jpool',
		'all',
	];

	if (!subType || !permittedSubTypes.includes(subType)) {

		if (perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
		) {
			return req.session;
		}
		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	if (subType === 'all') {
		return req.session;
	}

	// If it's a section, then I check up the chain for a round, event and
	// tourn that matches the parent.

	if (subType === 'section') {
		if (subType === 'section') {
			subType = 'panel';
		}
		const outputs = await db.sequelize.query(`
			select
				${subType}.*,
				event.category category,
				event.tourn tourn
			from ${subType}, round, event
			where ${subType}.id = :typeId
				and ${subType}.round = round.id
				and round.event = event.id
				and event.tourn = :tournId
		`, {
			replacements: {
				typeId,
				tournId,
			},
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (!outputs || !outputs.length > 0) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		const output = outputs.shift();

		if (
			perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
			|| req.session.perms.events?.[output.event].tag === 'tabber'
			|| req.session.perms.categories?.[output.category].tag === 'tabber'
		) {
			req.session[subType] = output;
			return req.session;
		}
		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	// If we're in a timeslot and you have non tournament level permissions, filter only
	// those timeslots which have rounds for the events that you are allowed access.

	if (subType === 'timeslot') {

		let queryLimiter = '';

		const replacements = {
			eventIds   : [],
			timeslotId : req.params.typeId,
			tournId    : req.params.tournId,
		};

		if (perms.tourn[tournId] !== 'owner' && perms.tourn[tournId] !== 'tabber') {

			if (req.session.perms?.event) {
				for (const eventId of Object.keys(req.session.perms.event)) {
					if (req.session.perms.event[eventId] === 'tabber') {
						replacements.eventIds.push(eventId);
					}
				}

				if (replacements.eventIds.length === 0) {
					return 'You do not have access to that timeslot through your event level permissions';
				}

				queryLimiter = `
					and exists (
						select round.id
							from round
						where round.timeslot = timeslot.id
							and round.event IN (:eventIds)
					)
				`;
			}
		}

		const outputs = await db.sequelize.query(`
			select
				${subType}.*,
				GROUP_CONCAT(event.id) as events
			from ${subType}, round, event
			where ${subType}.id = :timeslotId
				and ${subType}.id = round.${subType}
				and round.event = event.id
				and event.tourn = :tournId
				${queryLimiter}
			group by ${subType}.id
		`, {
			replacements,
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (!outputs || !outputs.length > 0) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		const output = outputs.shift();
		req.session[subType] = output;
		if (output.events) {
			req.session.event = output.events.split(',');
		}

		return req.session;
	}

	// If the data table's parent is an Event, it can go here and be reachable by an
	// event level permission.

	if (subType === 'round' || subType === 'entry') {
		const outputs = await db.sequelize.query(`
			select
				${subType}.*,
				event.category category,
				event.tourn tourn
			from ${subType}, event
			where ${subType}.id = :typeId
				and ${subType}.event = event.id
				and event.tourn = :tournId
		`, {
			replacements: {
				typeId,
				tournId,
			},
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (!outputs || !outputs.length > 0) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		const output = outputs.shift();

		if (
			perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
			|| perms.tourn[tournId] === 'checker'
			|| req.session.perms.event?.[output.event]
			|| req.session.perms.category?.[output.category]
		) {
			req.session[subType] = output;
			return req.session;
		}

		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	// If the data table's parent is a Category, it can go here and be reachable by an
	// category level permission.

	if (subType === 'event' || subType === 'judge' || subType === 'jpool') {

		const outputs = await db.sequelize.query(`
			select
				${subType}.*,
				category.tourn tournId
			from ${subType}, category
			where ${subType}.id = :typeId
				and ${subType}.category = category.id
				and category.tourn = :tournId
		`, {
			replacements: {
				typeId,
				tournId,
			},
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (!outputs || !outputs.length > 0) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		const output = outputs.shift();

		if (
			perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
			|| (subType === 'event' && req.session.perms.event?.[typeId] === 'tabber')
			|| req.session.perms.category?.[output.category] === 'tabber'
		) {
			req.session[subType] = output;
			return req.session;
		}

		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	if (subType === 'category') {
		const category = await db.summon(db.category, typeId);
		if (category.tourn !== req.session.tourn.id) {
			delete req.session.tourn;
			delete req.session.perms;
			return req.session;
		}

		if (
			perms.tourn[tournId] === 'owner'
			|| perms.tourn[tournId] === 'tabber'
			|| req.session.perms.categories?.[typeId].tag === 'tabber'
		) {
			req.session.category = category;
			return req.session;
		}
		delete req.session.tourn;
		delete req.session.perms;
		return req.session;
	}

	if ( perms.tourn[tournId] === 'owner' || perms.tourn[tournId] === 'tabber') {
		return req.session;
	}
};

export const tournPerms = async (tournId, personId) => {

	const permissions = await db.sequelize.query(`
		select permission.id, permission.event, permission.category, permission.tag
			from permission
		where person = :personId
			and tourn = :tournId
			order by tag
	`, {
		replacements: {
			tournId,
			personId,
		},
		type: db.sequelize.QueryTypes.SELECT,
	});

	if (permissions.length < 1) {
		return;
	}

	const perms = {
		tourn    : {},
		event    : {},
		category : {},
		contact  : {},
	};

	for await (const newPerm of permissions) {

		if (newPerm.tag === 'contact') {
			perms.contact[tournId] = true;
		} else if (newPerm.event) {
			perms.event[newPerm.event] = newPerm.tag;
		} else if (newPerm.category) {
			perms.category[newPerm.category] = newPerm.tag;
		} else if (
			(newPerm.tag === 'owner')
			|| (newPerm.tag === 'tabber'
					&& perms.tourn[tournId] !== 'owner')
			|| (newPerm.tag === 'checker'
					&& perms.tourn[tournId] !== 'owner'
					&& perms.tourn[tournId] !== 'tabber')
		) {
			perms.tourn[tournId] = newPerm.tag;
		}
	}

	if (!perms.tourn[tournId] && permissions.length > 0) {
		perms.tourn[tournId] = 'limited';
	}

	return perms;
};

export const coachAuth = async (req) => {

	const chapterId = req.params.chapterId;
	let chapterAccess = false;

	if (req.session.siteAdmin) {
		chapterAccess = true;
	} else {
		const perms = await db.sequelize.query(`
			select perm.id
			from permission perm
			where perm.person = :personId
				and perm.tag = 'chapter'
				and perm.chapter = :chapterId
		`, {
			replacements: {
				chapterId,
				personId: req.session.personId,
			},
			type: db.sequelize.QueryTypes.SELECT,
		});

		if (perms && perms[0].id) {
			chapterAccess = true;
		}
	}

	if (chapterAccess) {
		const chapter = await db.summon(db.chapter, chapterId);
		return chapter;
	}

	return 'You do not have access to that institution';
};

export const localAuth = async (req) => {

	// This one's a bit more of a pain because it handles several
	// different types of request

	const localType = req.params.localType;
	const localId = req.params.localId;

	if (
		localType === 'circuit'
		|| localType === 'chapter'
		|| localType === 'diocese'
		|| localType === 'district'
	) {

		const permissions = await db.sequelize.query(`
			select perm.id, perm.tag
				from permission perm
			where perm.person = :personId
				and perm.${localType} = :localId
		`, {
			replacements : {
				localId,
				personId: req.session.personId,
			},
			type: db.sequelize.queryTypes.SELECT,
		});

		if (permissions && permissions[0]?.tag) {
			const local = await db.summon(db[localType], localId);
			return { local, perms: permissions[0].tag };
		}
	}

	return `You have no access permissions to that ${localType}`;
};

export const hostAuth = async (req) => {

	// Request must originate from the local cron authorized hosts.
	// otherwise, in theory someone could try to DDOS us or something here
	if (req.config.CRON_HOSTS.includes(req.ip)) {
		return true;
	}
	return `Host ${req.ip} is not allowed to access automatic functions`;
};

export const checkJudgePerson = async (req, judgeId) => {

	if (!req.session) {
		return false;
	}

	if (req.session.siteAdmin) {
		return true;
	}

	const judge = await db.summon(db.judge, judgeId);

	if (judge.person === req.session.personId) {
		return true;
	}

	return false;
};

export const checkPerms = async (req, res, query, replacements) => {

	if (!req.session) {
		return 'You must be logged in to access that function';
	}

	if (req.session?.site_admin) {
		return true;
	}

	const [permsData] = await db.sequelize.query(query, {
		replacements,
		type: db.sequelize.QueryTypes.SELECT,
	});

	if (!permsData) {
		return 'Data about that tournament element was not found';
	}

	const permissions = await db.sequelize.query(`
		select permission.*
			from permission
		where permission.person = :personId
			and permission.tourn = :tournId
	`, {
		replacements: {
			personId: req.session.personId,
			tournId: permsData.tourn,
		},
		type: db.sequelize.QueryTypes.SELECT,
	});

	if (!permissions) {
		return 'You have no access permissions to tab that tournament';
	}

	const perms = {};

	for await (const perm of permissions) {
		if (perms.details) {
			perms[perm.tag] = JSON.parse(perms.details);
		} else {
			perms[perm.tag] = true;
		}
	}

	if (perms.owner) {
		return true;
	}

	if (permsData.ownerAccess) {
		return 'Only tournament owners may access that function';
	}

	if (perms.tabber) {
		return true;
	}

	if (permsData.site && permsData.timeslot) {
		const okEvents = await db.sequelize.query(`
			select
				distinct round(event) id
			from round
				where round.timeslot = :timeslotId
				and round.site = :siteId
		`, {
			replacements   : {
				timeslotId : permsData.timeslot,
				siteId     : permsData.site,
			},
			type: db.sequelize.QueryTypes.SELECT,
		});

		for await (const event of okEvents) {
			if (!permsData.event) {
				permsData.event = {};
			}
			permsData.event[event.id] = 'checker';
		}
	}

	if (req.session[permsData.tourn]) {
		if (req.session[permsData.tourn].level === 'owner') {
			return true;
		}

		if (
			req.session[permsData.tourn].level === 'tabber'
			&& req.threshold !== 'owner'
		) {
			return true;
		}

		if (
			req.session[permsData.tourn].level === 'checker'
			&& req.threshold !== 'tabber'
			&& req.threshold !== 'owner'
		) {
			return true;
		}

		if (req.session[permsData.tourn].level === 'by_event') {

			if (
				(req.threshold === 'tabber' || req.threshold === 'admin')
				&& req.session[permsData.tourn].event[permsData.event] === 'tabber'
			) {
				return true;
			}

			if (
				req.session[permsData.tourn].events
			) {

				if ( permsData.event
					&& req.session[permsData.tourn].events[permsData.event] === 'checker'
					&& req.threshold !== 'owner'
					&& req.threshold !== 'tabber'
				) {
					return true;
				}

				if ( permsData.event
					&& req.session[permsData.tourn].events[permsData.event] === 'tabber'
					&& req.threshold !== 'owner'
				) {
					return true;
				}

				if (permsData.events) {

					let OK = false;

					permsData.events.forEach( eventId => {

						if (req.session[permsData.tourn].events[eventId] === 'tabber'
							&& req.threshold !== 'owner'
						) {

							OK = true;
							return true;
						}

						if (req.session[permsData.tourn].events[eventId.toString()] === 'checker'
							&& req.threshold !== 'owner'
							&& req.threshold !== 'tabber'
						) {
							OK = true;
							return true;
						}
					});

					if (OK) {
						return true;
					}
				}
			}
		}
	}

	errorLogger.info({
		error     : true,
		message   : `You do not have permission to access that part of that tournament`,
	});

	return false;
};

export const sectionCheck = async (req, res, sectionId) => {

	const sectionQuery = `
		select event.tourn, event.id event
			from panel, round, event
		where panel.id = :sectionId
			and panel.round = round.id
			and round.event = event.id
	`;

	const replacements = { sectionId };
	return checkPerms(req, res, sectionQuery, replacements);
};

export const roundCheck = async (req, res, roundId) => {

	const roundQuery = `
		select event.tourn, event.id event
			from round, event
		where round.id = :roundId
			and round.event = event.id
	`;

	const replacements = { roundId };
	return checkPerms(req, res, roundQuery, replacements);
};

export const eventCheck = async (req, res, eventId) => {
	const eventQuery = `
		select event.tourn, event.id event
			from event
		where event.id = :eventId
	`;

	const replacements = { eventId };
	return checkPerms(req, res, eventQuery, replacements);
};

export const entryCheck = async (req, res, entryId) => {
	const entryQuery = `
		select event.tourn, entry.event
		from entry, event
		where entry.id = :entryId
			and entry.event = event.id
	`;

	const replacements = { entryId };
	return checkPerms(req, res, entryQuery, replacements);
};

export const schoolCheck = async (req, res, schoolId) => {
	const schoolQuery = `
		select school.tourn, school.id school
			from school
		where school.id = :schoolId
	`;

	const replacements = { schoolId };
	return checkPerms(req, res, schoolQuery, replacements);
};

export const timeslotCheck = async (req, res, timeslotId) => {
	const timeslotQuery = `
		select timeslot.tourn, timeslot.id timeslot
			from timeslot
		where timeslot.id = :timeslotId
	`;

	const replacements = { timeslotId };
	return checkPerms(req, res, timeslotQuery, replacements);
};

export const jpoolCheck = async (req, res, jpoolId) => {
	const jpoolQuery = `
		select category.tourn, jpool.id jpool, round.event event,
			st.value timeslot, jpool.site
			from (jpool, category)
				left join jpool_round jpr on jpr.jpool = jpool.id
				left join round on round.id = jpr.round
				left join jpool_setting st on st.tag = 'standby_timeslot' and st.jpool = jpool.id
		where jpool.id = :jpoolId
			and jpool.category = category.id
			group by jpool.id
	`;
	const replacements = { jpoolId };
	return checkPerms(req, res, jpoolQuery, replacements);
};

export const judgeCheck = async (req, res, judgeId) => {
	const judgeQuery = `
		select category.tourn, event.id event
			from category, event, judge
		where judge.id = :judgeId
			and judge.category = category.id
			and category.id = event.category
	`;

	const replacements = { judgeId };
	return checkPerms(req, res, judgeQuery, replacements);
};

export const categoryCheck = async (req, res, categoryId) => {
	const categoryQuery = `
		select category.tourn, event.id event
			from category, event
		where category.id = :categoryId
			and category.id = event.category
	`;

	const replacements = { categoryId };
	return checkPerms(req, res, categoryQuery, replacements);
};
