import { Router } from 'express';
import * as controller from '../../../../controllers/rest/roundController.js';

const router = Router({ mergeParams: true });

// Bolted onto /tourns/:tournId/rounds

router.get('/', controller.getPublishedRounds);
router.get('/:roundId', controller.getRound);
router.get('/:roundId/schematic', controller.getSchematic);

export default router;