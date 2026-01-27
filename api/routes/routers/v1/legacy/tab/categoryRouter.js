import { Router } from 'express';
import { getAccess,createAccess,updateAccess,deleteAccess } from '../../../../../controllers/tab/category/access.js';
import { updateCategoryLearn } from '../../../../../controllers/tab/category/learn.js';
const router = Router();

router.route('/:categoryId/access/:personId')
    .get(getAccess)
    .put(updateAccess)
    .delete(deleteAccess)
    .post(createAccess);
router.post('/:categoryId/updateLearn', updateCategoryLearn);

export default router;
