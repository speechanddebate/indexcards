import { Router } from 'express';
import { requireSiteAdmin } from '../../../../middleware/authorization.js';
import serversRouter from'./serversRouter.js';

const router = Router();

router.use(requireSiteAdmin);

router.use('/servers', serversRouter);

export default router;