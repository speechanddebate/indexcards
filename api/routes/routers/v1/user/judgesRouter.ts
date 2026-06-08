import { Router } from 'express';
import { ValidateRequest } from '../../../../middleware/validation.js';
import judgesController from '../../../../controllers/user/judgesController.js';
import { UnlinkedJudge, JudgeHistory } from '../../../openapi/schemas/index.ts';
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
		responses: {
			200: {
				description: 'Successful response',
				content: {
					'application/json': {
						schema: z.object({
							message: z.string().meta({
								description: 'A message indicating the claim request was submitted',
							}),
							detail: z.string().meta({
								description: 'Additional details about the claim request submission',
							}),
						}),
					},
				},
			},
		},
	}

router.route('/history')
	.get(ValidateRequest,judgesController.history).openapi = {
		summary: 'get judging history',
		description: 'Gets a persons history of judging',
		path: '/user/judges/history',
		operationId: 'UserJudgesHistory',
		tags: ['Orval','Judges'],
		requestParams: {
			query: z.object({
				limit: utils.limit.default(100),
				offset: utils.offset.default(0),
			})
		},
		responses: {
			200: {
				description: 'Successful response',
				content: {
					'application/json': {
						schema: JudgeHistory,
					},
				},
			},
		},
	}

router.route('/paradigm')
	.get(judgesController.getParadigm)
	.post(ValidateRequest, judgesController.updateParadigm).openapi = {
		path: '/user/judges/paradigm',
		get: {
			summary: 'get paradigm',
			responses: {

			}
		},
		post: {
			summary: 'update paradigm',
			requestBody: {
				content: {
					'application/json': {
						schema: z.object({
							paradigm: z.string().max(65535).meta({
								description: 'The new paradigm for the user',
							}),
						}),
					},
				},
			},
			responses: {
				204: {
					description: 'Paradigm updated successfully',
				},
				400: { '$ref': '#/components/responses/BadRequest' },
				403: { '$ref': '#/components/responses/Forbidden' },
			},
		}
	}
export default router;
