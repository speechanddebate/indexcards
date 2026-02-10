import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import * as districtController from '../../../../../controllers/tab/district/index.js';
import { divideSchools } from '../../../../../controllers/tab/district/supps.js';

const router = Router();

router.route('/:districtId')
  .get(requireAccess('district', 'read'), districtController.getDistrict)
  .post(requireAccess('district', 'write'), districtController.updateDistrict)
  .delete(requireAccess('district', 'write'), districtController.deleteDistrict);

router.post('/divideSchools/:numTeams', requireAccess('district', 'write'), divideSchools);

export default router;
