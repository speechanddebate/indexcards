import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import { updateEvent } from '../../../../../controllers/tab/event/index.js';
import { sectionTemplateRobin } from '../../../../../controllers/tab/event/roundrobin.js';
import * as accessController from '../../../../../controllers/tab/event/access.js';

const router = Router();

router.get('/:eventId', requireAccess('event', 'read'), updateEvent);
router.route('/:eventId/access/:personId')
    .get(requireAccess('event', 'write'), accessController.getAccess)
    .put(requireAccess('event', 'write'), accessController.updateAccess)
    .delete(requireAccess('event', 'write'), accessController.deleteAccess)
    .post(requireAccess('event', 'write'), accessController.createAccess);

router.route('/:eventId/backupAccess/:personId')
    .post(requireAccess('event', 'write'), accessController.createBackupAccess)
    .delete(requireAccess('event', 'write'), accessController.deleteBackupAccess);
router.post('/:eventId/section/robin/template', requireAccess('event', 'write'), sectionTemplateRobin);

export default router;
