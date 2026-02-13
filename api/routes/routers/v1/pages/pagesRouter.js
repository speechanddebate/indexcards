import { Router } from 'express';
import * as inviteController from '../../../../controllers/pages/invite/inviteController.js';

const router = Router();

router.get('/invite/nsdaCodes',inviteController.getNSDAEventCategories);
router.get('/invite/upcoming',inviteController.getFutureTourns);
router.get('/invite/:circuit',inviteController.getFutureTourns);
router.get('/invite/nextweek',inviteController.getThisWeekTourns);
router.get('/invite/webname/:webname',inviteController.getTournIdByWebname);

export default router;
