import { Router } from 'express';
import * as controller from '../../../../controllers/admin/serverController.js';

const router = Router();

router.get('/usage'             , controller.getTabroomUsage);
router.get('/show'              , controller.getInstances);
router.get('/show/:linodeId'    , controller.getTabroomInstance);
router.get('/status'            , controller.getInstanceStatus);
router.get('/count'             , controller.getTabroomInstanceCounts);
router.post('/reboot'           , controller.rebootInstance);
router.post('/changeCount'      , controller.changeInstanceCount);
router.delete('/changeCount/:id', controller.changeInstanceCount);

export default router;