import { Router } from 'express';
import adsRouter from './adsRouter.js';
import tournRouter from './tournRouter.js';

const router = Router();

router.use('/ads', adsRouter);
router.use('/tourns', tournRouter);

export default router;