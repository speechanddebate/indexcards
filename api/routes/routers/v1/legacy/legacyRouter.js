import { Router } from 'express';
import userRouter from './userRouter.js';
import coachRouter from './coachRouter.js';
import publicRouter from './public/indexRouter.js';
import tabRouter from './tab/indexRouter.js';

const router = Router();

router.use('/public',publicRouter);
router.use('/tab',tabRouter);
router.use('/user',userRouter);
router.use('/coach',coachRouter);

export default router;