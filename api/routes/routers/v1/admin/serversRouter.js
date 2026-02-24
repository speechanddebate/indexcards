import { Router } from 'express';
import * as controller from '../../../../controllers/admin/serverController.js';

const router = Router();

router.route('/usage').get(controller.getTabroomUsage).openapi = {
	path: '/admin/servers/usage',
	summary: 'TODO write spec',
	tags: ['Admin : Servers'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

router.route('/show').get(controller.getInstances).openapi = {
	path: '/admin/servers/show',
	summary: 'TODO write spec',
	tags: ['Admin : Servers'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

router.route('/show/:linodeId').get(controller.getTabroomInstance).openapi = {
	path: '/admin/servers/show/{linodeId}',
	summary: 'TODO write spec',
	tags: ['Admin : Servers'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

router.route('/status').get(controller.getInstanceStatus).openapi = {
	path: '/admin/servers/status',
	summary: 'TODO write spec',
	tags: ['Admin : Servers'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

router.route('/count').get(controller.getTabroomInstanceCounts).openapi = {
	path: '/admin/servers/count',
	summary: 'TODO write spec',
	tags: ['Admin : Servers'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

router.route('/reboot').post(controller.rebootInstance).openapi = {
	path: '/admin/servers/reboot',
	summary: 'TODO write spec',
	tags: ['Admin : Servers'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

router.route('/changeCount').post(controller.changeInstanceCount).openapi = {
	path: '/admin/servers/changeCount',
	summary: 'TODO write spec',
	tags: ['Admin : Servers'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

router.route('/changeCount/:id').delete(controller.changeInstanceCount).openapi = {
	path: '/admin/servers/changeCount/{id}',
	summary: 'TODO write spec',
	tags: ['Admin : Servers'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};

export default router;