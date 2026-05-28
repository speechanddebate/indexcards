import { Router } from 'express';
import { ValidateRequest } from '../../../../middleware/validation.js';
import judgesController from '../../../../controllers/user/judgesController.js';
import { UnlinkedJudge } from '../../../openapi/schemas/index.ts';
import z from 'zod';
import * as utils from '../../../openapi/schemas/utils.ts';

const router = Router();

router.route('/linkRequests')
	.get(ValidateRequest,judgesController.linkRequests).openapi = {
		summary: 'Get judge link requests',
		description: 'Get active judge link requests for the logged in user',
		path: '/user/judges/linkRequests',
		operationId: 'UserJudgesLinkRequests',
		tags: ['Orval'],
		responses: {
			200: {
				description: 'Successful response',
				content: {
					'application/json': {
						schema: z.array(UnlinkedJudge).meta({
							description: 'List of unlinked judges that have requested to be linked to the user',
						})
						},
					},
				},
			},
		};

router.route('/claim')
	.post(ValidateRequest,judgesController.claimRequest).openapi = {
		summary: 'Claim a judge',
		description: 'Claim a judge or chapter judge as the logged in user.',
		path: '/user/judges/claim',
		operationId: 'UserJudgesClaim',
		tags: ['Orval'],
		requestParams: {
			query: z.object({
				judgeId: utils.id.optional().meta({
					description: 'ID of the judge to claim (if claiming a judge)',
				}),
				chapterJudgeId: utils.id.optional().meta({
					description: 'ID of the chapter judge to claim (if claiming a chapter judge)',
				}),
			}),
		},
	}

export default router;