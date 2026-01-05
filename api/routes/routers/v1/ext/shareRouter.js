import { Router } from 'express';
import * as controller from '../../../../controllers/ext/share/shareController.js';
const router = Router();

router.post('/sendShareFile', controller.sendShareFile);
router.post('/makeShareRooms', controller.makeExtShareRooms);

export default router;