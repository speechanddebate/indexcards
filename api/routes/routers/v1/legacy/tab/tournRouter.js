import { Router } from 'express';
import * as controller from '../../../../../controllers/tab/tourn/index.js';
import { restoreTourn } from '../../../../../controllers/tab/tourn/backup.js';
import * as accessController from '../../../../../controllers/tab/tourn/access.js';

const router = Router();

router.route('/')
    .get(controller.getTourn)
    .post(controller.updateTourn)
    .delete(controller.deleteTourn);
//router.post('/backup', backupTourn); moved to new router
router.post('/restore', restoreTourn);
router.route('/access/:personId')
    .get(accessController.getAccess)
    .post(accessController.createAccess)
    .put(accessController.updateAccess)
    .delete(accessController.deleteAccess);
router.route('/backupAccess/:personId')
    .post(accessController.createBackupAccess)
    .delete(accessController.deleteBackupAccess);

export default router;
