import { Router } from 'express';
import * as controller from '../../../../controllers/ext/nsdaController.js';

const router = Router();

router.route('/history').get(controller.getPersonHistory).openapi = {
	path: '/ext/nsda/history',
	summary: 'Load history for a NSDA membership ID',
	operationId: 'getPersonHistory',
	security: [{ extApiKey: [] }],
	tags: ['Ext : NSDA'],
	parameters: [
		{
			in: 'query',
			name: 'nsda_id',
			description: 'NSDA Membership ID of person whose history you wish to access',
			required: true,
			schema: {
				type: 'integer',
				minimum: 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Person History',
			content: {
				'*/*': { schema: { type: 'object' } },
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/payment').get(controller.getPayment).openapi = {
	path: '/ext/nsda/payment',
	summary: 'Get payment information',
	security: [{ extApiKey: [] }],
	tags: ['Ext : NSDA'],
	responses: {
		200: { description: 'Payment information' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/payment').post(controller.postPayment).openapi = {
	path: '/ext/nsda/payment',
	summary: 'Process payment',
	security: [{ extApiKey: [] }],
	tags: ['Ext : NSDA'],
	responses: {
		201: { description: 'Payment processed' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/payment/tourn/:tournId').get(controller.getPayment).openapi = {
	path: '/ext/nsda/payment/tourn/{tournId}',
	summary: 'Get payment information for tournament',
	security: [{ extApiKey: [] }],
	tags: ['Ext : NSDA'],
	parameters: [
		{
			in: 'path',
			name: 'tournId',
			required: true,
			schema: { type: 'integer' },
		},
	],
	responses: {
		200: { description: 'Payment information' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/payment/tourn/:tournId').post(controller.postPayment).openapi = {
	path: '/ext/nsda/payment/tourn/{tournId}',
	summary: 'Process payment for tournament',
	security: [{ extApiKey: [] }],
	tags: ['Ext : NSDA'],
	parameters: [
		{
			in: 'path',
			name: 'tournId',
			required: true,
			schema: { type: 'integer' },
		},
	],
	responses: {
		201: { description: 'Payment processed' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/nats/appearances').get(controller.syncNatsAppearances).openapi = {
	path: '/ext/nsda/nats/appearances',
	summary: 'Sync NSDA Nationals appearances',
	security: [{ extApiKey: [] }],
	tags: ['Ext : NSDA'],
	responses: {
		200: { description: 'Appearances synced' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

router.route('/nats/placements').get(controller.natsIndividualHonors).openapi = {
	path: '/ext/nsda/nats/placements',
	summary: 'Get NSDA Nationals individual placements',
	security: [{ extApiKey: [] }],
	tags: ['Ext : NSDA'],
	responses: {
		200: { description: 'Individual placements' },
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

export default router;
