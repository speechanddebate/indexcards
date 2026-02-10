import { Router } from 'express';
import adsRouter from './adsRouter.js';
import pageRouter from './pageRouter.js';
import tournRouter from './tournRouter.js';

const router = Router();

router.use('/ads', adsRouter);
router.use('/pages', pageRouter);
router.use('/tourns', tournRouter);

export default router;