import con from '../../../../controllers/user/studentsController.js';
import { ValidateRequest } from '../../../../middleware/validation.js';
import { Router } from 'express';
import z from 'zod';
import { Student } from '../../../openapi/schemas/index.ts';
import * as utils from '../../../openapi/schemas/utils.ts';

const router = Router();

router.route('/linkRequests')
	.get(ValidateRequest,con.linkRequests).openapi = {
		summary: 'Get student link requests',
		description: 'Get active student link requests for the logged in user',
		path: '/user/students/linkRequests',
		operationId: 'UserStudentsLinkRequests',
		tags: ['Orval'],
		responses: {
			200: {
				description: 'Successful response',
				content: {
					'application/json': {
						schema: z.array(Student).meta({
							description: 'List of unlinked students that have requested to be linked to the user',
						})
						},
					},
				},
			},
		};

router.route('/claim')
	.post(ValidateRequest,con.claimRequest).openapi = {
		summary: 'Claim a student',
		description: 'Claim a student as the logged in user.',
		path: '/user/students/claim',
		operationId: 'UserStudentsClaim',
		tags: ['Orval'],
		requestParams: {
			query: z.object({
				studentId: utils.id.optional().meta({
					description: 'ID of the student to claim',
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

export default router;