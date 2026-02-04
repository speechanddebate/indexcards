import { Router } from 'express';
import controller from '../../../../../controllers/tab/categoryController.js';
import { requireAccess } from '../../../../../middleware/authorization.js';

const router = Router({ mergeParams: true });

router.route('/')
  .get(requireAccess('category', 'read'), controller.getCategories)
  .post(requireAccess('category', 'write'), controller.createCategory);
router.route('/:categoryId')
  .get(requireAccess('category', 'read'), controller.getCategory)
  .delete(requireAccess('category', 'write'), controller.deleteCategory)
  .put(requireAccess('category', 'write'), controller.updateCategory);

export default router;