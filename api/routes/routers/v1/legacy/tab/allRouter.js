import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization.js';
import { getTournDashboard, getTournAttendance, postTournAttendance } from '../../../../../controllers/tab/all/dashboard.js';
import { eventCheckin, categoryCheckin } from '../../../../../controllers/tab/all/checkin.js';
import { searchAttendees } from '../../../../../controllers/tab/all/search.js';

const router = Router();

router.get('/all/dashboard', requireAccess('tourn', 'read'), getTournDashboard);
router.route('/all/attendance')
    .get(requireAccess('tourn', 'read'), getTournAttendance)
    .post(requireAccess('tourn', 'write'), postTournAttendance);
router.post('/all/category/:categoryId/checkin', requireAccess('category', 'write'), categoryCheckin);
router.post('/all/event/:eventId/checkin', requireAccess('event', 'write'), eventCheckin);
router.get('/all/search/:searchString', requireAccess('tourn', 'read'), searchAttendees);

export default router;
