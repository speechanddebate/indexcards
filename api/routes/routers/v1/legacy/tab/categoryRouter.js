import { Router } from 'express';
import { getAccess,createAccess,updateAccess,deleteAccess } from '../../../../../controllers/tab/category/access.js';
import { updateCategoryLearn } from '../../../../../controllers/tab/category/learn.js';
import * as categoryController from '../../../../../controllers/tab/category/index.js';

const router = Router();

router.route('/')
    .get(categoryController.getCategory)
    .post(categoryController.updateCategory)
    .delete(categoryController.deleteCategory);
router.route('/:categoryId/access/:personId')
    .get(getAccess)
    .put(updateAccess)
    .delete(deleteAccess)
    .post(createAccess);
router.post('/:categoryId/randomize', categoryController.randomizeNames);
router.post('/:categoryId/updateLearn', updateCategoryLearn);

export default router;
