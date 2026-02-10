import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
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
	.get(requireAccess('jpool', 'read'), getJPool)
	.put(requireAccess('jpool', 'write'), updateJPool)
	.delete(requireAccess('jpool', 'write'), deleteJPool);

router.route('/:jpoolId/judge/:judgeId')
	.post(requireAccess('jpool', 'write'), createJPoolJudge)
	.delete(requireAccess('jpool', 'write'), deleteJPoolJudge);
router.route('/:jpoolId/judges')
	.get(requireAccess('jpool', 'read'), getJPoolJudges)
	.post(requireAccess('jpool', 'write'), createJPoolJudges)
	.delete(requireAccess('jpool', 'write'), deleteJPoolJudges);
router.route('/:jpoolId/round/:roundId')
	.post(requireAccess('jpool', 'write'), createJPoolRound)
	.delete(requireAccess('jpool', 'write'), deleteJPoolRound);

router.route('/:jpoolId/rounds')
	.get(requireAccess('jpool', 'read'), getJPoolRounds)
	.post(requireAccess('jpool', 'write'), createJPoolRounds)
	.delete(requireAccess('jpool', 'write'), deleteJPoolRounds);

router.post('/:jpoolId/blast', requireAccess('jpool', 'write'), blastJudges);
router.post('/:jpoolId/placeJudges/standby', requireAccess('jpool', 'write'), placeJudgesStandby);
router.post('/:jpoolId/placeJudges/nats', requireAccess('jpool', 'write'), placeJudgesNats);
router.post('/:jpoolId/placeJudges/suppOnly', requireAccess('jpool', 'write'), placeSuppOnlyJudges);

export default router;
