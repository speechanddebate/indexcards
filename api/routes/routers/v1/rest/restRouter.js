import { Router } from 'express';
import adsRouter from './adsRouter.ts';
import circuitsRouter from './circuitsRouter.ts';
import pageRouter from './pageRouter.js';
import tournsRouter from './tournsRouter.js';
import paradigmsRouter from './paradigmsRouter.js';
import studentsRouter from './studentsRouter.ts';

const router = Router();

router.use('/ads', adsRouter);
router.use('/circuits', circuitsRouter);
router.use('/pages', pageRouter);
router.use('/tourns', tournsRouter);
router.use('/paradigms', paradigmsRouter);
router.use('/students', studentsRouter);

export default router;