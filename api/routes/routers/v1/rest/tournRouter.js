import { Router } from 'express';
import * as controller from '../../../../controllers/rest/tournController.js';

import roundRouter from './roundRouter.js';

const router = Router({ mergeParams: true });

router.get('/:tournId',controller.getTourn);
router.use('/:tournId/rounds',roundRouter);
router.get('/:tournId/events',controller.getTournEvents);
router.get('/:tournId/invite',controller.getTournInvite);
router.get('/:tournId/files',controller.getPublishedFiles);
router.get('/:tournId/schedule',controller.getSchedule);

export default router;