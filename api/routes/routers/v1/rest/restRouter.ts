import { Router } from 'express';
import adsRouter from './adsRouter.js';
import circuitsRouter from './circuitsRouter.js';
import judgesRouter from './judgesRouter.js';
import pageRouter from './pageRouter.js';
import tournsRouter from './tournsRouter.js';
import paradigmsRouter from './paradigmsRouter.js';
import quizzesRouter from './quizzesRouter.js';
import studentsRouter from './studentsRouter.js';

const router = Router();

router.use('/ads', adsRouter);
router.use('/circuits', circuitsRouter);
router.use('/judges', judgesRouter);
router.use('/pages', pageRouter);
router.use('/tourns', tournsRouter);
router.use('/paradigms', paradigmsRouter);
router.use('/quizzes', quizzesRouter);
router.use('/students', studentsRouter);

export default router;