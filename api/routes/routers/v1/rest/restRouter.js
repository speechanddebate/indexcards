import { Router } from 'express';
import adsRouter from './adsRouter.js';

const router = Router();

router.use('/ads', adsRouter);

export default router;