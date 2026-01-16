import { Router } from 'express';
import * as controller from '../../../../../controllers/tab/section/blast.js';

const router = Router();

router.post('/:sectionId/blastPairing', controller.blastSectionPairing);
router.post('/:sectionId/blastMessage', controller.blastSectionMessage);

export default router;
