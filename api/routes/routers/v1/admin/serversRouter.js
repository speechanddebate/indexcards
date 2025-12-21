import { Router } from 'express';
import * as controller from '../../../../controllers/admin/serverController.js';

const router = Router();

router.get('/show'              , controller.getInstances);
router.get('/show/:linodeId'    , controller.getTabroomInstance);
router.get('/usage'             , controller.getTabroomUsage);
router.get('/status'            , controller.getInstanceStatus);
router.post('/reboot'           , controller.rebootInstance);
router.post('/changeCount'      , controller.createInstance);
router.delete('/changeCount/:id', controller.deleteInstance);

export default router;