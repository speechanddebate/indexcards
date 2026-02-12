import { Router } from 'express';
import tournsRouter from './tourns/tournsRouter.js';

const router = Router({ mergeParams: true });

// New routes first
router.use('/tourns', tournsRouter);

export default router;