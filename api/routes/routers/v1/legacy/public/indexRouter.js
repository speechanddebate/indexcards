import Router from 'express';
import { searchTourns, searchCircuitTourns } from '../../../../../controllers/public/search.js';

const router = Router();

router.get('/search/:time/:searchString/circuit/:circuitId', searchCircuitTourns);
router.get('/search/:time/:searchString', searchTourns);

export default router;