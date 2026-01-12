import { Router } from 'express';
import * as controller from '../../../../controllers/rest/pageController.js';

const router = Router();

router.get('/', controller.getPublicPages);
router.get('/:slug', controller.getPublicPages);

export default router;