import { Router } from 'express';
import { Backup } from '../../../../controllers/tab/tourn/backup.js';
import schoolsRouter from './schoolsRouter.js';

const router = Router();

router.post('/:tournId/backup', Backup);
router.use('/:tournId/schools', schoolsRouter);

export default router;