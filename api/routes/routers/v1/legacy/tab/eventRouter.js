import { Router } from 'express';
import { updateEvent } from '../../../../../controllers/tab/event/index.js';
import { sectionTemplateRobin } from '../../../../../controllers/tab/event/roundrobin.js';
import * as accessController from '../../../../../controllers/tab/event/access.js';

const router = Router();

router.get('/:eventId', updateEvent);
router.route('/:eventId/access/:personId')
    .get(accessController.getAccess)
    .put(accessController.updateAccess)
    .delete(accessController.deleteAccess)
    .post(accessController.createAccess);

router.route('/:eventId/backupAccess/:personId')
    .post(accessController.createBackupAccess)
    .delete(accessController.deleteBackupAccess);

router.post('/:eventId/section/robin/template', sectionTemplateRobin);

export default router;
