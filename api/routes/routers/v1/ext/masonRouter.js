import { Router } from 'express';
import * as controller from '../../../../controllers/ext/masonController.js';

const router = Router();

router.route('/round/:roundId/blast').post(controller.blastExtRoundPairing).openapi = {
	path: '/ext/mason/round/{roundId}/blast',
	summary: 'Send a round pairing blast',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Mason'],
	parameters: [
		{
			in: 'path',
			name: 'roundId',
			required: true,
			schema: { type: 'integer' },
		},
	],
	responses: {
		200: { description: 'Round pairing blast sent' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/blast').post(controller.blastMessage).openapi = {
	path: '/ext/mason/blast',
	summary: 'Send a blast message',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Mason'],
	responses: {
		200: { description: 'Message sent successfully' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/section/:sectionId/blastPairing').post(controller.blastPairing).openapi = {
	path: '/ext/mason/section/{sectionId}/blastPairing',
	summary: 'Send a pairing blast for a section',
	security: [{ extApiKey: [] }],
	tags: ['Ext : Mason'],
	parameters: [
		{
			in: 'path',
			name: 'sectionId',
			required: true,
			schema: { type: 'integer' },
		},
	],
	responses: {
		200: { description: 'Pairing blast sent' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default router;