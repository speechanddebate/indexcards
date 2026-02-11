import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import controller from '../../../../../controllers/tab/timeslotsController.js';

const router = Router({ mergeParams: true });

router.route('/')
	.get( requireAccess('tourn', 'read'),  controller.getTimeslots)
	.post(requireAccess('tourn', 'write'), controller.createTimeslot);

router.route('/:timeslotId')
	.get(   requireAccess('timeslot', 'read'),  controller.getTimeslot)
	.put(   requireAccess('timeslot', 'write'), controller.updateTimeslot)
	.delete(requireAccess('timeslot', 'write'), controller.deleteTimeslot);

export default router;