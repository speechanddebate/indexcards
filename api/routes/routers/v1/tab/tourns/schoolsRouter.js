import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization.js';
import * as controller from '../../../../../controllers/tab/schoolController.js';

const router = Router({ mergeParams: true });

router.route('/')
    .get( requireAccess('tourn', 'read'), controller.getSchools)
    .post(requireAccess('tourn', 'write'), controller.createSchool);

router.route('/:schoolId')
    .get(   requireAccess('tourn', 'read'),  controller.getSchool)
    .put(   requireAccess('tourn', 'write'), controller.updateSchool)
    .delete(requireAccess('tourn', 'write'), controller.deleteSchool);

export default router;