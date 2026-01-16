import { Router } from 'express';
import { getTournDashboard, getTournAttendance, postTournAttendance } from '../../../../../controllers/tab/all/dashboard.js';
import { eventCheckin, categoryCheckin } from '../../../../../controllers/tab/all/checkin.js';
import { searchAttendees } from '../../../../../controllers/tab/all/search.js';

const router = Router();

router.get('/all/dashboard', getTournDashboard);
router.route('/all/attendance')
    .get(getTournAttendance)
    .post(postTournAttendance);
router.post('/all/category/:categoryId/checkin', categoryCheckin);
router.post('/all/event/:eventId/checkin', eventCheckin);
router.get('/all/search/:searchString', searchAttendees);

export default router;
