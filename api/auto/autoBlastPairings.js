import db from '../helpers/litedb.js';
import Round from '../models/round.js';
import { errorLogger } from '../helpers/logger.js';
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

	pendingQueues.forEach( async (queue) => {

		let round = {};

		try {
			round = await Round.findOne(queue.round);
		} catch (err) {
			errorLogger.info(`Queue invocation failed to find round ${queue.round}`);
			errorLogger.info(queue);
			return;
		}

		// Set the round to publish and process the various dependencies thereof.
		if (queue.tag !== 'blast') {

			if (round.published !== 1) {
				round.published = 1;
				round.save();
			}

			// Docshare rooms
			await shareRooms(round.id);

			// Publish Flips
			await scheduleFlips(round.id);

			// Invalidate Caches
			await invalidateCache(round.tournId, round.id);
		}

		if (queue.tag !== 'publish') {
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
	});
};

await autoBlastRounds();
process.exit();
