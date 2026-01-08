import { Router } from 'express';
import * as controller from '../../../../controllers/rest/tournController.js';

const router = Router();

router.get('/:tournId',controller.getTourn);
router.get('/:tournId/invite',controller.getTournInvite);
router.get('/:tournId/files',controller.getPublishedFiles);

export default router;