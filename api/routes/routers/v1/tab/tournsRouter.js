import { Router } from 'express';
import { Backup } from '../../../../controllers/tab/tourn/backup.js';

const router = Router();

router.post('/:tournId/backup', Backup);

export default router;