import { Router } from 'express';
import { requireAccess } from '../../../../../../middleware/authorization/authorization.js';
import { getTournDashboard, getTournAttendance, postTournAttendance } from '../../../../../../controllers/tab/all/dashboard.js';
import { eventCheckin, categoryCheckin } from '../../../../../../controllers/tab/all/checkin.js';
import { searchAttendees } from '../../../../../../controllers/tab/all/search.js';

const router = Router({mergeParams: true});

router.get('/dashboard', requireAccess('tourn', 'read'), getTournDashboard);
router.route('/attendance')
    .get(requireAccess('tourn', 'read'), getTournAttendance)
    .post(requireAccess('tourn', 'write'), postTournAttendance);
router.post('/category/:categoryId/checkin', requireAccess('category', 'write'), categoryCheckin);
router.post('/event/:eventId/checkin', requireAccess('event', 'write'), eventCheckin);
router.get('/search/:searchString', requireAccess('tourn', 'read'), searchAttendees);

export default router;
