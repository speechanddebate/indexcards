import { showDateTime } from '@speechanddebate/nsda-js-utils';
import { flightTimes } from '../../../helpers/round.js';
import { errorLogger } from '../../../helpers/logger.js';
import { BadRequest, Forbidden, Unauthorized } from '../../../helpers/problem.js';
import db from '../../../data/db.js';

//  Perms work done, needs testing

export async function getTournAttendance(req, res) {
	const tournId = req.params.tournId;
	const perms = req.session.perms;

	if (!perms.tourn[tournId]) {
		res.status(200).json({ error: true, message: 'You do not have access to that tournament' });
		return;
	}

	let queryLimit = '';

	if (req.params.timeslotId) {
		req.params.timeslotId = parseInt(req.params.timeslotId);
	}

	if (req.params.roundId) {
		req.params.roundId = parseInt(req.params.roundId);
	}

	const replacements = {};
	const type = db.sequelize.QueryTypes.SELECT;

	if (req.params.timeslotId) {
		queryLimit = `where round.timeslot = :timeslotId`;
		replacements.timeslotId = req.params.timeslotId;
	} else if (req.params.roundId) {
		queryLimit = `where round.id = :roundId`;
		replacements.roundId = req.params.roundId;
	} else {
		return BadRequest(req, res, 'No parameters sent for query');
	}

	// Limit those with only some access to those events they have access to.
	if (
		perms.tourn[tournId] !== 'owner'
			&& perms.tourn[tournId] !== 'tabber'
	) {

		const eventIds = Object.keys(perms.event);
		const categoryIds = Object.keys(perms.category);

		if ( eventIds.length > 0 && categoryIds.length > 0) {
			queryLimit += ` and (
					round.event IN (:eventIds)
					OR round.event IN (
						select event.id from event where event.category IN (:categoryIds)
					)
				)`;
			replacements.eventIds = eventIds;
			replacements.categoryIds = categoryIds;

		} else if ( eventIds.length > 0 ) {

			queryLimit += ` and round.event IN (:eventIds)`;
			replacements.eventIds = eventIds;

		} else if ( categoryIds.length > 0 ) {
			queryLimit += ` and round.event IN (
					select event.id from event where event.category IN (:categoryIds)
				)`;
			replacements.categoryIds = categoryIds;
		}
	}

	// List of linked persons (students or judges) and their current status
	const attendanceResults = await db.sequelize.query(`
			select
				cl.panel panel, cl.tag tag, cl.description description,
					cl.timestamp timestamp,
				person.id person, person.first personFirst, person.last personLast,
				cl.marker markerId,
				tourn.tz tz

			from (panel, campus_log cl, tourn, person, round)

			${queryLimit}

				and panel.round = round.id
				and panel.id = cl.panel
				and cl.tourn = tourn.id
				and cl.tag != 'observer'
				and cl.person = person.id

				and ( exists (
						select ballot.id
							from ballot, judge, entry
						where judge.id = ballot.judge
							and judge.person = person.id
							and ballot.panel = panel.id
							and ballot.entry = entry.id
							and entry.active = 1
					) or exists (
						select ballot.id
							from ballot, entry_student es, student, entry
						where ballot.panel = panel.id
							and ballot.entry = es.entry
							and es.student = student.id
							and student.person = person.id
							and ballot.entry = entry.id
							and entry.active = 1
					)
				)
			order by cl.timestamp
		`, { replacements, type });

	const unlinkedAttendanceResults = await db.sequelize.query(`
			select
				cl.panel panel, cl.tag tag, cl.description description,
					cl.timestamp timestamp,
				cl.student student, cl.judge judge,
				person.id person, person.first personFirst, person.last personLast,
				cl.marker markerId,
				tourn.tz tz

			from (panel, campus_log cl, tourn, round)
				left join person on person.id = cl.person

			${queryLimit}

				and panel.round = round.id
				and panel.id = cl.panel
				and cl.tourn = tourn.id
				and cl.tag != 'observer'
				and (cl.person is NULL OR cl.person = 0)

				and ( exists (
						select ballot.id
							from ballot, entry
						where ballot.judge = cl.judge
							and ballot.panel = panel.id
							and ballot.entry = entry.id
							and entry.active = 1
					) or exists (
						select ballot.id
							from ballot, entry_student es, entry
						where ballot.panel = panel.id
							and ballot.entry = es.entry
							and es.student = cl.student
							and ballot.entry = entry.id
							and entry.active = 1
					)
				)
			order by cl.timestamp
		`, { replacements, type });

	// Attendance status by entry not person (when tagging
	// by team not student, such as in person).

	const entryAttendanceResults = await db.sequelize.query(`
			select
				cl.panel panel, cl.tag tag, cl.description description,
					cl.timestamp timestamp,
				person.id person, person.first personFirst, person.last personLast,
				cl.marker markerId,
				cl.entry entry, tourn.tz tz

			from (panel, campus_log cl, tourn, round, ballot, entry)

				left join person on person.id = cl.person

			${queryLimit}

				and panel.round = round.id
				and panel.id = cl.panel
				and cl.tourn = tourn.id
				and cl.entry = entry.id
				and cl.tag != 'observer'
				and panel.id = ballot.panel
				and ballot.entry = entry.id
				and entry.active = 1

			order by cl.timestamp
		`, { replacements, type });

	const startsResults = await db.sequelize.query(`
			select
				judge.person person, panel.id panel, panel.timestamp timestamp,
				ballot.judge_started startTime,
				ballot.audit audited,
				ballot.timestamp lastChange,
				cl.tag,
				started_by.id markerId,
				started_by.first startFirst, started_by.last startLast,
				judge.first judgeFirst, judge.last judgeLast,
				tourn.tz tz

			from (panel, tourn, round, ballot, event, judge, entry)

				left join person started_by on ballot.started_by = started_by.id
				left join campus_log cl on cl.panel = panel.id and cl.person = judge.person
					and cl.tag != 'observer'

			${queryLimit}

				and panel.round = round.id
				and round.event = event.id
				and event.tourn = tourn.id
				and ballot.panel = panel.id
				and ballot.judge = judge.id
				and ballot.judge_started > '1900-00-00 00:00:00'
				and ballot.entry = entry.id
				and entry.active = 1
			group by panel.id, judge.id
			order by ballot.timestamp
		`, { replacements, type });

	// Pull an array of all the ballots that have been audited fully.
	const confirmedResults = await db.sequelize.query(`
			select
				panel.id panel, panel.bye bye,
					confirmed_started.timestamp confirmedAt,
				confirmed_by.id markerId,
				CONCAT(confirmed_by.first,' ',confirmed_by.last) confirmedBy,
					panel.timestamp lastChange,
				tourn.tz tz

			from (panel, round, event, tourn)

				left join panel_setting confirmed_started
					on panel.id = confirmed_started.panel
					and confirmed_started.tag = 'confirmed_started'

				left join person confirmed_by
					on confirmed_by.id = confirmed_started.value

			${queryLimit}
				and round.id = panel.round
				and round.event = event.id
				and event.tourn = tourn.id
		`, { replacements, type });

	const status = {
		panel   : {},
		person  : {},
		entry   : {},
		judge   : {},
		student : {},
	};

	attendanceResults.forEach( attend => {

		if (status.person[attend.person] === undefined) {
			status.person[attend.person] = {};
		}

		status.person[attend.person][attend.panel] = {
			tag         : attend.tag,
			timestamp   : attend.timestamp.toJSON,
			description : attend.description,
			markerId    : attend.markerId,
		};
	});

	confirmedResults.forEach( confirmation => {
		if (confirmation.bye) {
			status.panel[confirmation.panel] = `Bye rounds don't need confirmation, silly`;
		} else if (confirmation.confirmedBy) {
			const timestamp = showDateTime(confirmation.confirmedAt, { tz: confirmation.tz, format: 'daytime' });
			status.panel[confirmation.panel] = `Confirmed by ${confirmation.confirmedBy} at ${timestamp}`;
		}
	});

	unlinkedAttendanceResults.forEach( attend => {

		if (attend.student) {
			status.student[attend.student] = {
				[attend.panel]  : {
					tag         : attend.tag,
					timestamp   : attend.timestamp.toJSON,
					description : attend.description,
					started     : showDateTime(attend.timestamp, { tz: attend.tz, format: 'daytime' }),
					markerId    : attend.markerId,
				},
			};
		} else if (attend.judge) {
			status.judge[attend.judge] = {
				[attend.panel]  : {
					tag         : attend.tag,
					timestamp   : attend.timestamp.toJSON,
					description : attend.description,
					started     : showDateTime(attend.timestamp, { tz: attend.tz, format: 'daytime' }),
					markerId    : attend.markerId,
				},
			};
		} else if (attend.person) {
			status.person[attend.person] = {
				[attend.panel]  : {
					tag         : attend.tag,
					timestamp   : attend.timestamp.toJSON,
					description : attend.description,
					started     : showDateTime(attend.timestamp, { tz: attend.tz, format: 'daytime' }),
					markerId    : attend.markerId,
				},
			};
		}
	});

	entryAttendanceResults.forEach( attend => {
		status.entry[attend.entry] = {
			[attend.panel]  : {
				tag         : attend.tag,
				timestamp   : attend.timestamp.toJSON,
				description : attend.description,
				started     : showDateTime(attend.timestamp, { tz: attend.tz, format: 'daytime' }),
				markerId    : attend.markerId,
			},
		};
	});

	startsResults.forEach( async (start) => {

		if (status.person[start.person] === undefined) {
			status.person[start.person] = {};
		}

		if (status.person[start.person][start.panel] === undefined) {
			status.person[start.person][start.panel] = {};
		}

		const myPanel = status.person[start.person][start.panel];

		if (start.startFirst === undefined) {
			myPanel.started_by = `${start.judgeFirst}  ${start.judgeLast}`;
		} else {
			myPanel.started_by = `${start.startFirst} ${start.startLast}`;
		}

		if (start.startTime) {
			myPanel.started = showDateTime(start.startTime, { tz: start.tz, format: 'daytime' });
		}

		myPanel.timestamp = start.timestamp;

		if (start.tag) {
			myPanel.tag = start.tag;
		} else {
			myPanel.tag = 'absent';
		}

		if (start.audited) {
			myPanel.audited = true;
			myPanel.lastChange = showDateTime(start.lastChange, { tz: start.tz, format: 'daytime' });
		}
	});

	if (status.count < 1) {
		return BadRequest(req, res, 'No events found in that tournament');
	}

	return res.status(200).json(status);
}
getTournAttendance.openapi = {
	summary: 'Room attedance and start status of a round or timeslot',
	operationId: 'tournAttendance',
	parameters: [
		{
			in		  : 'path',
			name		: 'tournId',
			description : 'Tournament ID',
			required	: true,
			schema	  : {
				type	: 'integer',
				minimum : 1,
			},
		},{
			in          : 'path',
			name        : 'roundId',
			description : 'Round ID',
			required    : false,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},{
			in          : 'path',
			name        : 'timeslotId',
			description : 'Timeslot ID',
			required    : false,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Status Data',
			content: {
				'*/*': {
					schema: {
						type: 'object',
						items: { $ref: '#/components/schemas/Event' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['tab/all'],
};

export async function postTournAttendance(req, res) {
	const tournId = req.params.tournId;
	const perms = req.session.perms;

	if (!perms.tourn[tournId]) {
		res.status(200).json({ error: true, message: 'You do not have access to that tournament' });
		return;
	}

	try {

		const now = Date();

		const targetType = req.body.target_type;
		const targetId = req.body.target_id;
		let target = '';

		if (targetType === 'student') {
			target = await db.student.findByPk(targetId);
		} else if (targetType === 'entry') {
			target = await db.entry.findByPk(targetId);
		} else if (targetType === 'judge') {
			target = await db.judge.findByPk(targetId);
		} else {
			target = await db.person.findByPk(targetId);
		}

		if (!target) {
			return res.status(201).json({
				error   : true,
				message : `No person to mark present for ID ${target} ${targetType} ${req.body.targetId}`,
			});
		}

		const panel = await db.panel.findByPk(req.body.panel);

		if (!panel) {
			return res.status(201).json({
				error   : true,
				message : `No section found for ID ${req.body.panel}`,
			});
		}

		if (req.body.setting_name === 'judge_started') {

			let judge = {};

			if (targetType === 'judge') {
				judge = target;
			} else {
				judge = await db.judge.findByPk(req.body.judge);
			}

			if (parseInt(req.body.property_name) > 0) {

				const eraseStart = `
					update ballot
						set started_by = NULL, judge_started = NULL
					where judge = :judgeId
						and panel = :panelId
				`;

				await db.sequelize.query(eraseStart, {
					replacements: { judgeId: judge.id, panelId: panel.id },
				});

				const response = {
					error : false,
					reclass: [
						{   id		  : `${panel.id}_${targetId}_start`,
							removeClass : 'greentext',
							addClass	: 'yellowtext',
						},{
							id		  : `${panel.id}_${targetId}_start`,
							removeClass : 'fa-star',
							addClass	: 'fa-stop',
						},
					],
					reprop: [
						{   id		  : `start_${panel.id}_${targetId}`,
							property	: 'property_name',
							value 		: false,
						},{
							id		  : `start_${panel.id}_${targetId}`,
							property	: 'title',
							value 		: 'Not started',
						},
					],
					message : 'Judge marked as not started',
				};

				return res.status(201).json(response);
			}

			await db.ballot.update({
				started_by    : req.session.person,
				judge_started : now,
			},{
				where : {
					panel : panel.id,
					judge : judge.id,
				},
			});

			const response = {
				error : false,
				reclass: [
					{   id		  : `${panel.id}_${targetId}_start`,
						addClass	: 'greentext',
						removeClass : 'yellowtext',
					},{
						id		  : `${panel.id}_${targetId}_start`,
						addClass	: 'fa-star',
						removeClass : 'fa-stop',
					},
				],
				reprop: [
					{   id		  : `start_${panel.id}_${targetId}`,
						property	: 'property_name',
						value 		: 1,
					},{
						id		  : `start_${panel.id}_${targetId}`,
						property	: 'title',
						value 		: `Judge marked as started by ${req.session.name}`,
					},
				],
				message : `Judge marked as started by ${req.session.name}`,
			};

			return res.status(201).json(response);
		}

		if (parseInt(req.body.property_name) === 1) {

			// The property already being 1 means that they're currently
			// present, so mark them as absent.

			let logMessage;

			if (target.first) {
				logMessage = `${target.first} ${target.last} marked as absent by ${req.session.email}`;
			} else if (target.code) {
				logMessage = `${target.code} marked as absent by ${req.session.email}`;
			}

			const log = {
				marker 		: req.session.person,
				tag         : 'absent',
				description : logMessage,
				tourn       : tournId,
				panel       : panel.id,
			};

			if (targetType === 'student') {
				log.student = target.id;
			} else if (targetType === 'entry') {
				log.entry = target.id;
			} else if (targetType === 'judge') {
				log.judge = target.id;
			} else {
				log.person = target.id;
			}

			await db.campusLog.create(log);

			// Oh for the days I have active webpages going and don't need
			// to do the following nonsense

			return res.status(201).json({

				error   : false,
				message : logMessage,
				marker  : req.session.person,

				reclass : [
					{	id          : targetType && targetType !== 'person' ? `${panel.id}_${targetType}_${targetId}` : `${panel.id}_${targetId}`,
						removeClass : 'greentext',
						addClass    : 'brightredtext',
					},
					{	id          : targetType && targetType !== 'person' ? `${panel.id}_${targetType}_${targetId}` : `${panel.id}_${targetId}`,
						removeClass : 'fa-check',
						addClass    : 'fa-circle',
					},
				],
				reprop  : [
					{	id       : `container_${panel.id}_${targetId}`,
						property : 'property_name',
						value    : false,
					},
				],
			});
		}

		// In this case they're currently marked absent, so we mark them
		// present

		let logMessage;
		if (target.first) {
			logMessage = `${target.first} ${target.last} marked as present by ${req.session.email}`;
		} else if (target.code) {
			logMessage = `${target.code} marked as present by ${req.session.email}`;
		}

		const log = {
			tag         : 'present',
			description : logMessage,
			tourn       : tournId,
			panel       : panel.id,
			marker 		: req.session.person,
		};

		if (targetType === 'student') {
			log.student = target.id;
		} else if (targetType === 'entry' || req.body.setting_name === 'offline_entry') {
			log.entry = target.id;
		} else if (targetType === 'judge') {
			log.judge = target.id;
		} else {
			log.person = target.id;
		}

		await db.campusLog.create(log);

		return res.status(201).json({
			error   : false,
			message : logMessage,
			markerId: req.session.person,
			reclass : [
				{	id          : targetType && targetType !== 'person' ? `${panel.id}_${targetType}_${targetId}` : `${panel.id}_${targetId}`,
					addClass	: 'greentext',
					removeClass : 'brightredtext',
				},
				{	id          : targetType && targetType !== 'person' ? `${panel.id}_${targetType}_${targetId}` : `${panel.id}_${targetId}`,
					addClass	: 'fa-check',
					removeClass : 'fa-circle',
				},
			],
			reprop  : [
				{	id	   : `container_${panel.id}_${targetId}`,
					property : 'property_name',
					value	: 1,
				},
			],
		});

	} catch (err) {
		errorLogger.info(`Error caught in tournAttendance of the dashboard`);
		errorLogger.info(err);
	}
}
postTournAttendance.openapi = {
	summary: 'Mark or unmark a member of a room as present',
	operationId: 'tournAttendance',
	tags: ['tab/all'],
	responses: {
		200: {
			description: 'Status Deltas',
			content: {
				'*/*': {
					schema: {
						type: 'object',
						items: { $ref: '#/components/schemas/Person' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

// Enables the overall listing of event status for the entire tournament
export async function getTournDashboard(req, res) {
	const tournId = req.params.tournId;

	if (!req.session) {
		return Unauthorized(req, res, 'You are not logged in to view the dashboard');
	}

	const perms = req.session.perms;

	if (!perms.tourn[tournId]) {
		return Forbidden(req, res,'You do not have access to that tournament');
	}

	const replacements = {
		tournId,
	};

	let queryLimit = '';

	// Limit those with only some access to those events they have access to.
	if (
		perms.tourn[tournId] !== 'owner'
			&& perms.tourn[tournId] !== 'tabber'
			&& perms.tourn[tournId] !== 'checker'
	) {

		const eventIds = Object.keys(perms.event);
		const categoryIds = Object.keys(perms.category);

		if (eventIds.length > 0 && categoryIds.length > 0) {
			queryLimit = ` and (
					round.event IN (:eventIds)
					OR round.event IN (
						select event.id from event where event.category IN (:categoryIds)
					)
				)`;
			replacements.eventIds = eventIds;
			replacements.categoryIds = categoryIds;

		} else if (eventIds.length > 0) {

			queryLimit = ` and round.event IN (:eventIds)`;
			replacements.eventIds = eventIds;

		} else if (categoryIds.length > 0) {
			queryLimit = ` and round.event IN (
					select event.id from event where event.category IN (:categoryIds)
				)`;
			replacements.categoryIds = categoryIds;
		}
	}

	const statusResults = await db.sequelize.query(`
			select
				event.id event_id, event.name event_name, event.abbr event_abbr,
				round.id roundId, round.name round_name, round.type round_type,
				round.label, round.flighted, round.type,
				round.start_time round_start,
				timeslot.start timeslot_start,
				panel.id panel, panel.flight,
				ballot.id ballot, ballot.judge judge,
					ballot.audit, ballot.judge_started,
				score.id score_id, score.tag

			from (round, panel, ballot, event, tourn, timeslot, entry)

				left join score on score.ballot = ballot.id
					and score.tag in ('winloss', 'point', 'rank')

			where round.event = event.id

				${queryLimit}

				and event.tourn     = :tournId
				and round.id        = panel.round
				and panel.id        = ballot.panel
				and round.event     = event.id
				and event.tourn     = tourn.id
				and round.timeslot  = timeslot.id
				and ballot.entry    = entry.id
				and entry.active    = 1
				and round.published = 1
				and panel.bye       = 0
				and ballot.bye      = 0
				and ballot.forfeit  = 0
				and ballot.judge    != 0
				and ballot.judge    IS NOT NULL

				and exists (
					select b2.id
					from ballot b2, panel p2
					where 1 = 1
					and p2.round   = round.id
					and p2.id      = b2.panel
					and b2.bye     = 0
					and b2.forfeit = 0
					and b2.judge   > 0
				)
			order by event.abbr, round.name, ballot.judge, ballot.audit
		`, {
		replacements,
		type: db.sequelize.QueryTypes.SELECT,
	});

	const status = { done: {}, keys : [] };

	const lasts = {};

	for (const result of statusResults) {

		// Judges have more than one ballot per section so stop if we've seen you before

		if (status.done[result.panel]?.[result.judge]) {
			continue;
		}

		// If the round isn't on the status board already, create an object for it

		if (!status[result.roundId]) {

			const times = await flightTimes(result.roundId);
			const numFlights = result.flighted || 1;

			if (result.flight > numFlights) {
				result.flight = numFlights;
			}

			status[result.roundId] = {
				eventId   : result.event_id,
				eventName : result.event_abbr,
				roundId   : result.roundId,
				number    : result.round_name,
				name      : result.label ? result.label : `Rd ${result.round_name}`,
				type      : result.round_type,
				undone    : false,
				started   : false,
				flights   : {},
			};

			status.keys.push(result.roundId);

			for (let f = 1; f <= numFlights; f++) {
				status[result.roundId].flights[f] = {
					done      : 0,
					half      : 0,
					started   : 0,
					nada      : 0,
					...times[f],
				};
			}

			if (!lasts[result.event_id] || lasts[result.event_id] < result.round_name) {
				lasts[result.event_id] = result.round_name;
			}
		}

		// Prevent future duplicates.  This incidentally is why the sql
		// query sorts by ballot.audit; unaudited ballots come first and
		// won't slip through.

		if (status.done[result.panel]) {
			status.done[result.panel][result.judge] = true;
		} else {
			status.done[result.panel] = {
				[result.judge] : true,
			};
		}

		if (status[result.roundId].flights?.[result.flight]) {

			if (result.audit) {

				// Is the ballot done?
				status[result.roundId].flights[result.flight].done++;
				status[result.roundId].started = true;

			} else {

				status[result.roundId].undone = true;

				if (result.score_id) {
					// Does the ballot have scores?
					status[result.roundId].flights[result.flight].half++;
					status[result.roundId].started = true;
				} else if (result.judge_started) {
					status[result.roundId].flights[result.flight].started++;
					status[result.roundId].started = true;
				} else {
					status[result.roundId].flights[result.flight].nada++;
				}
			}
		}
	}

	for (const roundId of status.keys) {
		if (
			status[roundId].type !== 'final'
				&& status[roundId].number !== lasts[status[roundId].eventId]
				&& !status[roundId].undone
		) {
			delete status[roundId];
		}
	}

	delete status.done;

	return res.status(200).json(status);
}
getTournDashboard.openapi = {
	summary     : 'Event by event status for the tournament dashboard',
	operationId : 'tournDashboard',
	parameters  : [
		{
			in          : 'path',
			name        : 'tournId',
			description : 'Tournament ID',
			required    : false,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Event Current Status Data',
			content: {
				'*/*': {
					schema: {
						type: 'object',
						items: { $ref: '#/components/schemas/Event' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['tab/all'],
};
