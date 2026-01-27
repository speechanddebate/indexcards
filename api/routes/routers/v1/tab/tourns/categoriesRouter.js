import { Router } from 'express';
import controller from '../../../../../controllers/tab/categoryController.js';

const router = Router({ mergeParams: true });

router.route('/')
  .get(controller.getCategories)
  .post(controller.createCategory);
router.route('/:categoryId')
  .get(controller.getCategory)
  .delete(controller.deleteCategory)
  .put(controller.updateCategory);

export default router;