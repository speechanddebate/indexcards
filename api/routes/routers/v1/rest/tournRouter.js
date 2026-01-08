import { Router } from 'express';
import * as controller from '../../../../controllers/rest/tournController.js';

const router = Router();

router.get('/:tournId/invite',controller.getTournInvite);

export default router;