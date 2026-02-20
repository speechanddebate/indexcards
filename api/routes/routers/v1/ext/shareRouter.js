import { Router } from 'express';
import * as controller from '../../../../controllers/ext/share/shareController.js';
const router = Router();

router.route('/sendShareFile').post(controller.sendShareFile).openapi = {
	path: '/ext/share/sendShareFile',
	summary: 'Sends a document to the docchain email list for a room',
	operationId: 'sendShareFile',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Share'],
	requestBody: {
		description: 'Initialize the doc chain room and emails',
		required: true,
		content: { 'application/json': { schema: { $ref: '#/components/schemas/Share' } } },
	},
	responses: {
		201: {
			description: 'Success',
			content: {
				'*/*': {
					schema: {
						type: 'string',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/makeShareRooms').post(controller.makeExtShareRooms).openapi = {
	path: '/ext/share/makeShareRooms',
	summary: 'Create share rooms',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Share'],
	responses: {
		200: { description: 'Rooms created successfully' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default router;