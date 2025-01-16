import db from '../helpers/litedb.js';
import { shareRooms } from  '../controllers/tab/round/share.js';
import { scheduleFlips } from  '../controllers/tab/round/flips.js';
import { invalidateCache } from '../helpers/round.js';
import { blastRoundPairing } from '../controllers/tab/round/blast.js';

const autoBlastRounds = async () => {

	const pendingQueues = await db.sequelize.query(`
		select aq.id, aq.tag, aq.created_at,
			aq.created_by,
			round.id roundId, round.name, round.label, round.published,
			event.tourn tournId, event.type eventType, event.abbr eventAbbr
		from (autoqueue aq, round, event, tourn)
		where (aq.active_at < NOW() OR aq.active_at IS NULL)
			and aq.tag IN ("blast", "publish", "blast_publish")
			and aq.round = round.id
			and round.event = event.id
			and event.tourn = tourn.id
		order by aq.created_at
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const promises = [];

	const aq = db.sequelize.query(`
		delete autoqueue.*
			from autoqueue
		where (autoqueue.active_at < NOW() OR autoqueue.active_at IS NULL)
			and autoqueue.tag IN ("blast", "publish", "blast_publish")
	`, {
		type: db.Sequelize.QueryTypes.DELETE,
	});

	promises.push(aq);

	pendingQueues.forEach( async (round) => {

		// Set the round to publish and process the various dependencies
		// thereof.

		if (round.tag !== 'blast') {

			if (round.published !== 1) {

				const publish = db.sequelize.query(`
					update round set published = 1 where round.id = :roundId
				`, {
					replacements: {
						roundId: round.roundId,
					},
					type: db.Sequelize.QueryTypes.UPDATE,
				});

				promises.push(publish);
			}

			if (round.eventType === 'debate') {
				// Docshare rooms
				const share = shareRooms(round.roundId);
				promises.push(share);
			}

			if (round.eventType === 'debate' || round.eventType === 'wsdc') {
				// Publish Flips
				const flips = scheduleFlips(round.roundId, round.created_by);
				promises.push(flips);
			}

			// Invalidate Caches
			if (process.env.NODE_ENV === 'production') {
				const production = invalidateCache(round.tournId, round.roundId);
				promises.push(production);
			}
		}

		if (round.tag !== 'publish') {
			// Blast the round! BLAST IT!

			const req = {
				body: {
					sender     : round.created_by,
					noResponse : true,
					message    : round.message,
				},
				session : {
					person : round.created_by,
				},
				params: {
					roundId: round.roundId,
					tournId: round.tournId,
				},
				db,
			};

			const res = {};
			const blast = blastRoundPairing.POST(req, res);
			promises.push(blast);
		}

	});

	await Promise.all(promises);
};

await autoBlastRounds();
process.exit();
