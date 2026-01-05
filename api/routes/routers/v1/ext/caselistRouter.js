import { Router } from 'express';
import * as controller from '../../../../controllers/ext/caselistController.js';

const router = Router();

router.get('/chapters', controller.getPersonChapters);
router.get('/rounds'  , controller.getPersonRounds);
router.get('/students', controller.getPersonStudents);
router.post('/link'   , controller.postCaselistLink);

export default router;