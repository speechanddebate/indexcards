import { Router } from 'express';
import * as controller from '../../../controllers/authController.js';

const router = Router();

router.post('/login', controller.login);
router.post('/logout', controller.logout);
router.post('/register', controller.register);

export default router;