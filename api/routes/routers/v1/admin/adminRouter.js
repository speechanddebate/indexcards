import { Router } from 'express';
import { requireSiteAdmin } from '../../../../middleware/authorization/authorization.js';
import serversRouter from'./serversRouter.js';

import * as controller from '../../../../controllers/admin/mailtestController.js';

const router = Router();

router.use(requireSiteAdmin);

router.use('/servers', serversRouter);
router.get('/mailtest/error' , controller.throwTestError);
router.get('/mailtest/slack' , controller.testSlackNotification);

export default router;