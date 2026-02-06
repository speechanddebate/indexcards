import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import * as controller from '../../../../../controllers/tab/tourn/index.js';
import { restoreTourn } from '../../../../../controllers/tab/tourn/backup.js';
import * as accessController from '../../../../../controllers/tab/tourn/access.js';

const router = Router();

router.route('/')
    .get(requireAccess('tourn', 'read'), controller.getTourn)
    .post(requireAccess('tourn', 'write'), controller.updateTourn)
    .delete(requireAccess('tourn', 'write'), controller.deleteTourn);
//router.post('/backup', backupTourn); moved to new router
router.post('/restore', requireAccess('tourn', 'write'), restoreTourn);
router.route('/access/:personId')
    .get(requireAccess('tourn', 'read'), accessController.getAccess)
    .post(requireAccess('tourn', 'write'), accessController.createAccess)
    .put(requireAccess('tourn', 'write'), accessController.updateAccess)
    .delete(requireAccess('tourn', 'write'), accessController.deleteAccess);
router.route('/backupAccess/:personId')
    .post(requireAccess('tourn', 'write'), accessController.createBackupAccess)
    .delete(requireAccess('tourn', 'write'), accessController.deleteBackupAccess);

export default router;
