import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import * as controller from '../../../../../controllers/tab/section/blast.js';

const router = Router();

router.post('/:sectionId/blastPairing', requireAccess('section', 'write'), controller.blastSectionPairing);
router.post('/:sectionId/blastMessage', requireAccess('section', 'write'), controller.blastSectionMessage);

export default router;
