import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization.js';
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

router.get('/:roundId/attendance', requireAccess('round', 'read'), getTournAttendance);

router.post('/:roundId/blast', requireAccess('round', 'write'), blastRoundPairing);

router.get('/:roundId/blastStatus',
	requireAccess('round', 'read'), roundBlastStatus);
router.get('/:roundId/dashboard',
	requireAccess('round', 'read'), getTournDashboard);
router.get('/:roundId/log',
	requireAccess('round', 'read'), getRoundChangeLog);
router.post('/:roundId/makeShareRooms',
	requireAccess('round', 'write'), makeShareRooms);
router.post('/:roundId/merge',
	requireAccess('round', 'write'), mergeTimeslotRounds);

router.post('/:roundId/message',
	requireAccess('round', 'write'), blastRoundMessage);

router.get('/:roundId/sidecount',
	requireAccess('round', 'read'), sideCounts);
router.get('/:roundId/status',
	requireAccess('round', 'read'), roundDecisionStatus);
router.post('/:roundId/unmerge',
	requireAccess('round', 'write'), unmergeTimeslotRounds);
export default router;
