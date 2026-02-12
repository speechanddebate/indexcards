import { Router } from 'express';
import { Backup } from '../../../../../controllers/tab/tourn/backup.js';
import categoriesRouter from './categoriesRouter.js';
import schoolsRouter from './schoolsRouter.js';
import sitesRouter from './sitesRouter.js';
import timeslotsRouter from './timeslotsRouter.js';
import { loadTournAuthContext } from '../../../../../middleware/authorization/authContext.js';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';

import legacyAllRouter from './legacy/allRouter.js';
import legacyRoundRouter from './legacy/roundRouter.js';

const router = Router({mergeParams: true });

router.param('tournId', loadTournAuthContext);

router.post('/:tournId/backup',requireAccess('tourn', 'read'), Backup);
router.use('/:tournId/categories', categoriesRouter);
router.use('/:tournId/schools', schoolsRouter);
router.use('/:tournId/sites', sitesRouter);
router.use('/:tournId/timeslots', timeslotsRouter);

router.use('/:tournId/all', legacyAllRouter);
router.use('/:tournId/rounds', legacyRoundRouter);

export default router;