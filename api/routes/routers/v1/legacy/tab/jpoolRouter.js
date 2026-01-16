import { Router } from 'express';
import {
	getJPool,
	updateJPool,
	deleteJPool,
	createJPoolJudge,
	deleteJPoolJudge,
	getJPoolJudges,
	createJPoolJudges,
	deleteJPoolJudges,
	createJPoolRound,
	deleteJPoolRound,
	getJPoolRounds,
	createJPoolRounds,
	deleteJPoolRounds,
} from '../../../../../controllers/tab/jpool/index.js';
import { blastJudges } from '../../../../../controllers/tab/jpool/blast.js';
import { placeJudgesNats, placeSuppOnlyJudges } from '../../../../../controllers/tab/jpool/nats.js';
import { placeJudgesStandby } from '../../../../../controllers/tab/jpool/standby.js';

const router = Router();

router.route('/:jpoolId')
	.get(getJPool)
	.put(updateJPool)
	.delete(deleteJPool);

router.route('/:jpoolId/judge/:judgeId')
	.post(createJPoolJudge)
	.delete(deleteJPoolJudge);

router.route('/:jpoolId/judges')
	.get(getJPoolJudges)
	.post(createJPoolJudges)
	.delete(deleteJPoolJudges);

router.route('/:jpoolId/round/:roundId')
	.post(createJPoolRound)
	.delete(deleteJPoolRound);

router.route('/:jpoolId/rounds')
	.get(getJPoolRounds)
	.post(createJPoolRounds)
	.delete(deleteJPoolRounds);

router.post('/:jpoolId/blast', blastJudges);
router.post('/:jpoolId/placeJudges/standby', placeJudgesStandby);
router.post('/:jpoolId/placeJudges/nats', placeJudgesNats);
router.post('/:jpoolId/placeJudges/suppOnly', placeSuppOnlyJudges);

export default router;
