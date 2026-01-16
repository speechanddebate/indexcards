import { Router } from 'express';
import { sideCounts, roundDecisionStatus } from '../../../../../controllers/tab/round/index.js';
import { getRoundChangeLog } from '../../../../../controllers/tab/round/changeLog.js';
import {
	blastRoundPairing,
	blastRoundMessage,
	roundBlastStatus,
} from '../../../../../controllers/tab/round/blast.js';
import { getTournDashboard, getTournAttendance } from '../../../../../controllers/tab/all/dashboard.js';
import { makeShareRooms } from '../../../../../controllers/tab/round/share.js';
import { mergeTimeslotRounds, unmergeTimeslotRounds } from '../../../../../controllers/tab/round/merge.js';

const router = Router();

router.get('/:roundId/attendance', getTournAttendance);

router.post('/:roundId/blast',blastRoundPairing);

router.get('/:roundId/blastStatus',roundBlastStatus);

router.get('/:roundId/dashboard', getTournDashboard);
router.get('/:roundId/log', getRoundChangeLog);
router.post('/:roundId/makeShareRooms', makeShareRooms);
router.post('/:roundId/merge', mergeTimeslotRounds);

router.post('/:roundId/message', blastRoundMessage);

router.get('/:roundId/sidecount', sideCounts);
router.get('/:roundId/status', roundDecisionStatus);
router.post('/:roundId/unmerge', unmergeTimeslotRounds);

export default router;
