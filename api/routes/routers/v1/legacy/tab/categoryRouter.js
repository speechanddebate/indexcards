import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import { getAccess,createAccess,updateAccess,deleteAccess } from '../../../../../controllers/tab/category/access.js';
import { updateCategoryLearn } from '../../../../../controllers/tab/category/learn.js';
const router = Router();

router.route('/:categoryId/access/:personId')
	.all(requireAccess('category', 'write'))
    .get(getAccess)
    .put(updateAccess)
    .delete(deleteAccess)
    .post(createAccess);
router.post('/:categoryId/updateLearn',requireAccess('category', 'write'), updateCategoryLearn);

export default router;
