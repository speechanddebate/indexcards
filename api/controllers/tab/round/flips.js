// Functions to handle the online coinflip
import { db } from '../../../helpers/litedb.js';
import Autoqueue from '../../../models/autoqueue.js';
import { errorLogger } from '../../../helpers/logger.js';

export const scheduleRoundFlips = {
	POST: async (req, res) => {
		const counter = await scheduleFlips(req.params.roundId);
		return res.status(201).json({ message: `Successfully scheduled ${counter} coinflips` });
	},
};

export const scheduleFlips = async (roundId) => {

	let flips = [];

	try {
		flips = await db.sequelize.query(`
			select round.flighted, round.type, round.published,
				round.start_time startTime, timeslot.start,
				CONVERT_TZ(flip_already.active_at, '+00:00', tourn.tz) activeAt,
				event.id eventId,
				flip_online.value online,
				flip_autopublish.value autoPublish,
				flip_before_start.value beforeStart,
				flip_split_flights.value splitFlights,
				flight_offset.value flightOffset,
				no_side_constraints.value nsc,
				sidelock_elims.value sidelockElims,
				tourn.tz

			from (round, event, timeslot, tourn)

				left join event_setting flip_online
					on flip_online.event = event.id
					and flip_online.tag = 'flip_online'

				left join event_setting flip_autopublish
					on flip_autopublish.event = event.id
					and flip_autopublish.tag = 'flip_autopublish'

				left join event_setting flip_before_start
					on flip_before_start.event = event.id
					and flip_before_start.tag = 'flip_before_start'

				left join event_setting flight_offset
					on flight_offset.event = event.id
					and flight_offset.tag = 'flight_offset'

				left join event_setting flip_split_flights
					on flip_split_flights.event = event.id
					and flip_split_flights.tag = 'flip_split_flights'

				left join event_setting no_side_constraints
					on no_side_constraints.event = event.id
					and no_side_constraints.tag = 'no_side_constraints'

				left join event_setting sidelock_elims
					on sidelock_elims.event = event.id
					and sidelock_elims.tag = 'sidelock_elims'

				left join autoqueue flip_already
					on flip_already.round = round.id
					and flip_already.tag like 'flip%'

			where round.id = :roundId
				and round.event = event.id
				and round.timeslot = timeslot.id
				and event.tourn = tourn.id
		`, {
			replacements: { roundId },
			type: db.Sequelize.QueryTypes.SELECT,
		});

	} catch (err) {
		errorLogger.info(`Flip schedule failed for round ${roundId} with error`);
		errorLogger.info(err);
		return;
	}

	if (!flips || flips.length < 1) {
		return;
	}

	const round = flips[0];
	let posted = false;

	if (round.type !== 'elim'
		&& round.type !== 'final'
		&& round.type !== 'runoff'
		&& (!round.nsc)
	) {
		posted = true;
	}

	if (!round.published) {
		posted = true;
	}

	if (round.sidelockElims) {
		posted = true;
	}

	let message = '';

	if (posted === false) {

		if (round.already) {

			const already = new Date(round.already);
			message += `Auto-flips already scheduled for ${already}`;

		} else if (round.online && (round.beforeStart || round.autoPublish)) {

			let startDate = new Date();

			if (round.beforeStart) {

				if (round.startTime) {
					startDate = new Date(round.startTime);
				} else {
					startDate = new Date(round.start);
				}

				startDate.setMinutes(startDate.getMinutes() - round.beforeStart);
				message += ` and flips scheduled to happen at ${startDate} `;

			} else if (round.autopublish) {

				startDate.setMinutes(startDate.getMinutes() - round.autopublish);
				message += ` and flips scheduled to happen at ${startDate} `;
			}

			if (round.flighted > 1 && round.flightOffset && round.splitFlights) {

				for (let flight = 1; flight < round.flighted; flight++) {
					Autoqueue.create({
						tag        : `flip_${flight}`,
						round      : roundId,
						active_at  : round.activeAt,
						created_at : new Date(),
					});

					// Add the offset to the start time for the next flight
					startDate.setMinutes(startDate.getMinutes() - round.flightOffset);
				}

			} else {

				await Autoqueue.create({
					tag        : `flip`,
					round      : roundId,
					active_at  : round.activeAt,
					created_at : new Date(),
				});
			}
		}
	}

	return message;
};
