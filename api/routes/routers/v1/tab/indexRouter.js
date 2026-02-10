import { Router } from 'express';
import tournsRouter from './tourns/tournsRouter.js';

const router = Router();

router.use('/tourns', tournsRouter);

export default router;