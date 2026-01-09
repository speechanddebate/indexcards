import { Router } from 'express';
import * as controller from '../../../../controllers/ext/masonController.js';

const router = Router();

router.post('/round/:roundId/blast', controller.blastExtRoundPairing);
router.post('/blast', controller.blastMessage);
router.post('/section/:sectionId/blastPairing', controller.blastPairing);

export default router;