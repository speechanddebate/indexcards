import moment from 'moment-timezone';
import { getFollowers, getPairingFollowers } from '../../../helpers/followers.js';
import { errorLogger } from '../../../helpers/logger.js';
import { notify } from '../../../helpers/blast.js';
import { sendPairingBlast, formatPairingBlast } from '../../../helpers/pairing.js';

export const blastRoundMessage = {

	POST: async (req, res) => {

		if (!req.body.message) {
			res.status(200).json({ error: true, message: 'No message to blast sent' });
		}

		const personIds = await getFollowers(req.body);

		const notifyResponse = await notify({
			ids  : personIds,
			text : req.body.message,
		});

		if (notifyResponse.error) {
			errorLogger.error(notifyResponse.message);
			res.status(200).json(notifyResponse);
		} else {

			await req.db.changeLog.create({
				tag         : 'blast',
				description : `${req.body.message} sent to ${notifyResponse.push?.count || 0} recipients`,
				person      : req.session.person,
				count       : notifyResponse.push?.count || 0,
				panel       : req.params.roundId,
			});

			await req.db.changeLog.create({
				tag         : 'emails',
				description : `${req.body.message} sent to ${notifyResponse.email?.count || 0}`,
				person      : req.session.person,
				count       : notifyResponse.email?.count || 0,
				panel       : req.params.roundId,
			});

			res.status(200).json({
				error   : false,
				message : notifyResponse.message,
			});
		}
	},
};

export const scheduleAutoFlip = async (roundId, req) => {

	const roundData = await req.db.sequelize.query(`
		select round.id, round.flighted, round.type, round.published,
			round.flighted flights,
			round.start_time roundstart, timeslot.start,
			event.id event,
			flip_autopublish.value flip_autopublish,
			flip_before_start.value flip_before_start,
			flip_split_flights.value flip_split_flights,
			flight_offset.value flight_offset,
			flip_published.value flip_published,
			no_side_constraints.value no_side_constraints,
			tourn.tz

		from (round, event, timeslot, tourn)

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

		left join round_setting flip_published
			on flip_published.round = round.id
			and flip_published.tag = 'flip_published'

		left join event_setting no_side_constraints
			on no_side_constraints.event = event.id
			and no_side_constraints.tag = 'no_side_constraints'

		where round.id = :roundId

			and round.event = event.id
			and round.timeslot = timeslot.id
			and event.tourn = tourn.id
			and not exists (
				select es.id
					from event_setting es
				where es.event = event.id
					and es.tag = 'sidelock_elims'
			)

			and exists (
				select fo.id
					from event_setting fo
				where fo.event = event.id
					and fo.tag = 'flip_online'
			)
			and not exists (
				select fa.id
					from autoqueue fa
				where fa.round = round.id
					and fa.tag like 'flip_%'
			)
		`, {
		replacements : { roundId },
		type         : req.db.sequelize.QueryTypes.SELECT,
	});

	if (roundData) {
		roundData.forEach( async (round) => {

			if (!round.no_side_constraints
				&& ( round.type !== 'elim'
					&& round.type !== 'final'
					&& round.type !== 'runoff'
				)
			) {
				return;
			}

			if (!round.roundstart) {
				round.roundstart = round.start;
			}

			const flipAt = {};
			let flights = [];

			if (round.flip_split_flights) {
				flights = [...Array(round.flights).keys()];
			} else {
				flights = [0];
			}

			if (round.flip_before_start) {
				flights.forEach( (tick) => {
					const flight = tick + 1;
					flipAt[flight] = moment(round.roundstart)
						.add( (parseInt(tick * round.flight_offset) - parseInt(round.flip_before_start)), 'minutes');
				});
			} else if (round.flip_autopublish) {
				flights.forEach( (tick) => {
					const flight = tick + 1;
					flipAt[flight] = moment()
						.add(parseInt((tick * round.flight_offset) + parseInt(round.flip_autopublish)), 'minutes');
				});
			}

			flights.forEach( async (tick) => {
				const flight = tick + 1;

				if (round.flip_split_flights) {
					await req.db.autoqueue.create({
						tag        : `flip_${flight}`,
						round      : round.id,
						active_at  : flipAt[flight],
						created_at : Date(),
					});
				} else {
					await req.db.autoqueue.create({
						tag        : `flip`,
						round      : round.id,
						active_at  : flipAt[flight],
						created_at : Date(),
					});
				}
			});
		});
	}
};

// Blast a single round with a pairing
export const blastRoundPairing = {

	POST: async (req, res) => {

		let sender = '';
		if (req.body?.sender) {
			sender = req.body?.sender;
		} else if (req.session?.person?.id) {
			sender = req.session?.person?.id;
		} else {
			sender = req.session.person;
		}

		const queryData = {};
		queryData.replacements = { roundId : req.params.roundId };
		queryData.where = 'where section.round = :roundId';
		queryData.fields = '';

		if (req.body.publish) {
			await req.db.sequelize.query(
				`update round set published = 1 where round.id = :roundId `, {
					replacements : queryData.replacements,
					type         : req.db.sequelize.QueryTypes.UPDATE,
				});

			await req.db.changeLog.create({
				tag         : 'publish',
				description : `Round published`,
				person      : sender,
				round       : req.params.roundId,
			});
			await scheduleAutoFlip(req.params.roundId, req, res);
		}

		await req.db.sequelize.query(
			`delete from round_setting where round = :roundId and tag = 'blasted'`, {
				replacements : queryData.replacements,
				type         : req.db.sequelize.QueryTypes.UPDATE,
			});

		await req.db.sequelize.query(
			`insert into round_setting (tag, round, value_date, value) values ('blasted', :roundId, now(), 'date')`, {
				replacements : queryData.replacements,
				type         : req.db.sequelize.QueryTypes.UPDATE,
			});

		const blastData = await formatPairingBlast(queryData, req);
		blastData.sender = sender;
		const followers = await getPairingFollowers(
			queryData.replacements,
			{ ...req.body },
		);

		if (req.body.message) {
			blastData.append = req.body.message;
		}
		if (req.body.append) {
			blastData.append = req.body.append;
		}

		const browserResponse = sendPairingBlast(followers, blastData, req, res);

		if (req.params.timeslotId) {
			return browserResponse;
		}

		res.status(200).json(browserResponse.message);

	},
};

export default blastRoundMessage;
