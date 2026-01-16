import { Router } from 'express';
import { circuitQualifiers } from '../../../../../controllers/tab/result/qualifier.js';

const router = Router();

router.post('/postQualifiers', circuitQualifiers);

export default router;
