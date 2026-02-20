import { Router } from 'express';
import * as controller from '../../../../controllers/rest/eventController.js';

const router = Router({ mergeParams: true });
// Bolted onto /tourns/:tournId/events

router.get('/', controller.getTournEvents);
router.get('/:eventAbbr/field', controller.getEntryFieldByEvent);

// router.get('/:eventId', controller.getEventById);
// Need to distinguish this from a normal request by event ID which will be
// needed
router.get('/byAbbr/:eventAbbr', controller.getEventByAbbr);

export default router;