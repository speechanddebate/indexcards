import { Router } from 'express';
import * as timeslotController from '../../../../../controllers/tab/timeslot/index.js';
import { blastTimeslotMessage, blastTimeslotPairings, messageFreeJudges } from '../../../../../controllers/tab/timeslot/blast.js';
import { getTournDashboard, getTournAttendance } from '../../../../../controllers/tab/all/dashboard.js';

const router = Router();

router.route('/:timeslotId')
  .get(timeslotController.getTimeslot)
  .post(timeslotController.createTimeslot)
  .delete(timeslotController.deleteTimeslot);
router.post('/:timeslotId/blast', blastTimeslotPairings);
router.post('/:timeslotId/message', blastTimeslotMessage);
router.post('/:timeslotId/message/free', messageFreeJudges);
router.get('/:timeslotId/dashboard', getTournDashboard);
router.get('/:timeslotId/attendance', getTournAttendance);

export default router;
