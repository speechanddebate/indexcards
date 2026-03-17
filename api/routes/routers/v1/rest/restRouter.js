import { Router } from 'express';
import adsRouter from './adsRouter.js';
import circuitsRouter from './circuitsRouter.js';
import pageRouter from './pageRouter.js';
import tournsRouter from './tournsRouter.js';
import paradigmsRouter from './paradigmsRouter.js';

const router = Router();

router.use('/ads', adsRouter);
router.use('/circuits', circuitsRouter);
router.use('/pages', pageRouter);
router.use('/tourns', tournsRouter);
router.use('/paradigms', paradigmsRouter);

export default router;