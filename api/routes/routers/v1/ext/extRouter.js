import { Router } from 'express';
import { requireAreaAccess } from '../../../../middleware/authorization/authorization.js';

import caselist from './caselistRouter.js';
import share from './shareRouter.js';
import nsda from './nsdaRouter.js';
import mason from './masonRouter.js';

import { login } from '../../../../controllers/ext/loginController.js';
import {ipLocation} from '../../../../controllers/rest/personController.js';

const router = Router();

router.post('/login', login);

router.use('/:area',requireAreaAccess);
router.use('/caselist', caselist);
router.use('/share', share);
router.use('/nsda', nsda);
router.use('/mason', mason);
router.get('/iplocation/:ipAddress', ipLocation);

export default router;