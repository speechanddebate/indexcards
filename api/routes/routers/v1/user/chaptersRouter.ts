import { Router } from 'express';
import controller from '../../../../controllers/user/chapter/index.js';
import { UserChapter } from '../../../openapi/schemas/index.ts';
import z from 'zod';

const router = Router();

router.route('/')
	.get(controller.userChapters).openapi = {
		path: '/user/chapters',
		summary: 'GET User Chapters',
		description: 'returns a list of chapters a person has permissions in.',
		operationId: 'UserChapters',
		tags: ['Orval', 'Chapter'],
		responses: {
			200: {
				description: 'User chapters',
				content: {
					'application/json': {
						schema: z.array(UserChapter),
					},
				},
			},
		}
	};
router.route('/byTourn/:tournId')
	.get(controller.userChaptersByTourn).openapi = {
	path: '/user/chapters/byTourn/{tournId}',
	tags: ['legacy', 'User Chapters'],
	parameters: [{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Chapters by tournament' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/byTourn/:tournId/mySchools')
	.get(controller.getMySchoolsByTourn).openapi = {
	path: '/user/chapters/byTourn/{tournId}/mySchools',
	tags: ['legacy', 'User Chapters'],
	parameters: [{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'My schools by tournament' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/byTourn/:tournId/nonSchools')
	.get(controller.getMyChaptersNonTourn).openapi = {
	path: '/user/chapters/byTourn/{tournId}/nonSchools',
	tags: ['legacy', 'User Chapters'],
	parameters: [{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Non-school chapters by tournament' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

export default router;
