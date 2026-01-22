import { Router } from 'express';
import * as controller from '../../../../controllers/tab/schoolController.js';

const router = Router({ mergeParams: true });

router.route('/')
    .get(controller.getSchools)
    .post(controller.createSchool);

router.route('/:schoolId')
    .get(controller.getSchool)
    .put(controller.updateSchool)
    .delete(controller.deleteSchool);

export default router;