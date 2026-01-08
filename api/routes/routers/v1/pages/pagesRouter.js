import { Router } from 'express';
import * as tournController from '../../../../controllers/rest/tournController.js';

const router = Router();

router.get('/invite/tourn/:tournId', tournController.getTournInvite);

export default router;