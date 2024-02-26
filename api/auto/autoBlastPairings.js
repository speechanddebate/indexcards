import db from '../helpers/litedb.js';
import { shareRooms } from  '../controllers/tab/round/share.js';
import { scheduleFlips } from  '../controllers/tab/round/flips.js';
import { invalidateCache } from '../helpers/round.js';
import { blastRoundPairing } from '../controllers/tab/round/blast.js';

const autoBlastRounds = async () => {

	const pendingQueues = await db.sequelize.query(`
		select autoqueue.*,	tourn.id tournId
			from autoqueue, round, event, tourn
		where (autoqueue.active_at < NOW() OR autoqueue.active_at IS NULL)
			and autoqueue.tag IN ("blast", "publish", "blast_publish")
			and autoqueue.round = round.id
			and round.event = event.id
			and event.tourn = tourn.id
		order by created_at
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
	});

	await db.sequelize.query(`
		delete autoqueue.*
			from autoqueue
		where (autoqueue.active_at < NOW() OR autoqueue.active_at IS NULL)
			and autoqueue.tag IN ("blast", "publish", "blast_publish")
	`, {
		type: db.Sequelize.QueryTypes.DELETE,
	});

	for await (const queue of pendingQueues) {

		const rounds = await db.sequelize.query(`
			select
				round.id, round.name, round.label, round.published,
				event.tourn tournId
			from round, event
			where round.id = :roundId
			and round.event = event.id
		`, {
			replacements: {
				roundId: queue.round,
			},
			type: db.Sequelize.QueryTypes.SELECT,
		});

		if (rounds.length < 1) {
			return;
		}

		const round = rounds.shift();

		// Set the round to publish and process the various dependencies thereof.
		if (queue.tag !== 'blast') {

			if (round.published !== 1) {
				await db.sequelize.query(`
					update round set published = 1 where round.id = :roundId
				`, {
					replacements: {
						roundId: round.id,
					},
					type: db.Sequelize.QueryTypes.UPDATE,
				});
			}

			console.log(`round ${round.id} has been marked published`);

			// Docshare rooms
			await shareRooms(round.id);

			// Publish Flips
			await scheduleFlips(round.id);

			// Invalidate Caches
			if (process.env.NODE_ENV === 'production') {
				await invalidateCache(round.tournId, round.id);
			}
		}

		if (queue.tag !== 'publish') {

			console.log(`Blasting and here we go with round`);
			console.log(round);

			// Blast the round! BLAST IT!

			const req = {
				body: {
					sender     : queue.created_by,
					noResponse : true,
					message    : queue.message,
				},
				params: {
					roundId: round.id,
				},
				db,
			};

			const res = {};
			await blastRoundPairing.POST(req, res);
		}
	}
};

await autoBlastRounds();
process.exit();
