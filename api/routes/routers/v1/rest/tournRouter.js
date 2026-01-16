import { Router } from 'express';
import * as controller from '../../../../controllers/rest/tournController.js';
import { requirePublicTourn } from '../../../../policy/tournPolicy.js';
import roundRouter from './roundRouter.js';
import eventRouter from './eventRouter.js';

const router = Router({ mergeParams: true });

router.use('/:tournId', requirePublicTourn);
router.get('/:tournId',controller.getTourn);
router.use('/:tournId/rounds',roundRouter);
router.use('/:tournId/events',eventRouter);
router.get('/:tournId/invite',controller.getTournInvite);
router.get('/:tournId/files',controller.getPublishedFiles);
router.get('/:tournId/schedule',controller.getSchedule);
router.get('/:tournId/results',controller.getTournPublishedResults);

export default router;