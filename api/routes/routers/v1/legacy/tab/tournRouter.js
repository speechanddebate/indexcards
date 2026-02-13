import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import { restoreTourn } from '../../../../../controllers/tab/tourn/backup.js';
import * as accessController from '../../../../../controllers/tab/tourn/access.js';

import roundRouter from '../../tab/tourns/legacy/roundRouter.js';

const router = Router({ mergeParams: true });

//router.post('/backup', backupTourn); moved to new router
router.post('/:tournId/restore', requireAccess('tourn', 'write'), restoreTourn);
router.route('/:tournId/access/:personId')
    .get(requireAccess('tourn', 'read'), accessController.getAccess)
    .post(requireAccess('tourn', 'write'), accessController.createAccess)
    .put(requireAccess('tourn', 'write'), accessController.updateAccess)
    .delete(requireAccess('tourn', 'write'), accessController.deleteAccess);
router.route('/:tournId/backupAccess/:personId')
    .post(requireAccess('tourn', 'write'), accessController.createBackupAccess)
    .delete(requireAccess('tourn', 'write'), accessController.deleteBackupAccess);

router.use('/:tournId/rounds', roundRouter);

export default router;
