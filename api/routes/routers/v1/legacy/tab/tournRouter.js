import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import * as controller from '../../../../../controllers/tab/tourn/index.js';
import { restoreTourn } from '../../../../../controllers/tab/tourn/backup.js';
import * as accessController from '../../../../../controllers/tab/tourn/access.js';

import roundRouter from '../../tab/tourns/legacy/roundRouter.js';

const router = Router({ mergeParams: true });

router.route('/:tournId')
    .get(requireAccess('tourn', 'read'), controller.getTourn)
    .post(requireAccess('tourn', 'write'), controller.updateTourn)
    .delete(requireAccess('tourn', 'write'), controller.deleteTourn);
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
