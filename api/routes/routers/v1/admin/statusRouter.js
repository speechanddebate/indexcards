import { Router } from 'express';
import * as controller from '../../../../controllers/public/status.js';
const router = Router();

router.get('/', controller.systemStatus);
router.get('/barf', controller.barfPlease);
export default router;
