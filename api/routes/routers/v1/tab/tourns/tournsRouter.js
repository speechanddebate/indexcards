import { Router } from 'express';
import { Backup } from '../../../../../controllers/tab/tourn/backup.js';
import categoriesRouter from './categoriesRouter.js';
import schoolsRouter from './schoolsRouter.js';
import sitesRouter from './sitesRouter.js';
import { loadAuthContext, requireAccess } from '../../../../../middleware/authorization/authorization.js';

const router = Router();

router.use(loadAuthContext);

router.post('/:tournId/backup',requireAccess('tourn', 'read'), Backup);
router.use('/:tournId/categories', categoriesRouter);
router.use('/:tournId/schools', schoolsRouter);
router.use('/:tournId/sites', sitesRouter);

export default router;