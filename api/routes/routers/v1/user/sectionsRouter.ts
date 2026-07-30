import { Router } from 'express';
import { getCurrentBallots } from '../../../../controllers/user/ballotsController.js';

// /user/sections
const router = Router();

router.route('/current')
	.get(getCurrentBallots).openapi = {
		summary: "Get current ballots",
		path: "/user/sections/current",
		operationId: "UserBallotsCurrent",
	};


export default router;
