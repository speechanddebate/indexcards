import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import { blastTimeslotMessage, blastTimeslotPairings, messageFreeJudges } from '../../../../../controllers/tab/timeslot/blast.js';
import { getTournDashboard, getTournAttendance } from '../../../../../controllers/tab/all/dashboard.js';

const router = Router();

router.post('/:timeslotId/blast', requireAccess('timeslot', 'write'), blastTimeslotPairings);
router.post('/:timeslotId/message', requireAccess('timeslot', 'write'), blastTimeslotMessage);
router.post('/:timeslotId/message/free', requireAccess('timeslot', 'write'), messageFreeJudges);
router.get('/:timeslotId/dashboard', requireAccess('timeslot', 'read'), getTournDashboard);
router.get('/:timeslotId/attendance', requireAccess('timeslot', 'read'), getTournAttendance);

export default router;
