import { Router } from 'express';
import adsRouter from './adsRouter.js';
import pageRouter from './pageRouter.js';
import tournRouter from './tournRouter.js';
import paradigmsRouter from './paradigmsRouter.js';

const router = Router();

router.use('/ads', adsRouter);
router.use('/pages', pageRouter);
router.use('/tourns', tournRouter);
router.use('/paradigms', paradigmsRouter);

export default router;