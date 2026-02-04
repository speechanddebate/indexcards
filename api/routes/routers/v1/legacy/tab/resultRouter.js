import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization.js';
import { circuitQualifiers } from '../../../../../controllers/tab/result/qualifier.js';

const router = Router();

router.post('/postQualifiers', requireAccess('tourn', 'write'), circuitQualifiers);

export default router;
