import { Router } from 'express';
import * as districtController from '../../../../../controllers/tab/district/index.js';
import { divideSchools } from '../../../../../controllers/tab/district/supps.js';

const router = Router();

router.route('/:districtId')
  .get(districtController.getDistrict)
  .post(districtController.updateDistrict)
  .delete(districtController.deleteDistrict);

router.post('/divideSchools/:numTeams', divideSchools);

export default router;
