import { Router } from 'express';
import * as controller from '../../../../controllers/rest/roundController.js';

const router = Router({ mergeParams: true });

router.get('/',controller.getPublishedRounds);
router.get('/:roundId',controller.getRound);
router.get('/:roundId/schematic',controller.getSchematic);

export default router;