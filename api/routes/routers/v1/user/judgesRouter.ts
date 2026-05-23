import { Router } from 'express';
import { ValidateRequest } from '../../../../middleware/validation.js';
import { requireLogin } from '../../../../middleware/authorization/authorization.js';
import z from 'zod';
import judgesController from '../../../../controllers/user/judgesController.js';
const router = Router();

router.route('/linkRequests')
	.get(ValidateRequest,judgesController.linkRequests).openapi = {
	summary: 'Search for unlinked judges',
	path: 'user/judges/linkRequests',
	operationId: 'UserJudgesLinkRequests',

	};

export default router;