import { Router } from 'express';
import * as controller from '../../../../controllers/rest/eventController.js';

const router = Router({ mergeParams: true });

router.get('/',controller.getTournEvents);
router.get('/:eventAbbr/field',controller.getEntryFieldByEvent);
router.get('/:eventAbbr',controller.getEventByAbbr);

export default router;