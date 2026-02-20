import { Router } from 'express';
import { requireAreaAccess } from '../../../../middleware/authorization/authorization.js';

import caselist from './caselistRouter.js';
import share from './shareRouter.js';
import nsda from './nsdaRouter.js';
import mason from './masonRouter.js';

import { login } from '../../../../controllers/ext/loginController.js';
import {ipLocation} from '../../../../controllers/rest/personController.js';

const router = Router();

router.route('/login').post(login).openapi = {
	path: '/ext/login',
	summary: 'External login',
	tags: ['Ext'],
	responses: {
		200: { description: 'Login successful' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.use('/:area',requireAreaAccess);
router.use('/caselist', caselist);
router.use('/share', share);
router.use('/nsda', nsda);
router.use('/mason', mason);
router.get('/iplocation/:ipAddress', ipLocation);

export default router;