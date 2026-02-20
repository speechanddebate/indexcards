import { Router } from 'express';
import { requireAccess } from '../../../../../middleware/authorization/authorization.js';
import controller from '../../../../../controllers/tab/siteController.js';

const router = Router({ mergeParams: true });

router.route('/').get( requireAccess('tourn', 'read'),  controller.getSites).openapi = {
	path: '/tab/tourns/{tournId}/sites',
	summary: 'Get sites',
	tags: ['Sites & Rooms'],
	responses: {
		200: {
			description: 'A list of sites for the tourn',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/SiteResponse' },
					},
					examples: {
						sites: {
							summary: 'Example response',
							value: [
								{
									id: 1,
									name: 'Lincoln High School',
									online: false,
									directions: '123 Main St, Anytown, USA',
									dropoff: 'Use the side entrance on 2nd Ave.',
									hostId: 5,
									circuitId: 2,
									createdAt: '2023-01-01T00:00:00Z',
									updatedAt: '2023-01-02T00:00:00Z',
								},
							],
						},
					},
				},
			},
		},
	},
};

router.route('/').post(requireAccess('tourn', 'write'), controller.createSite).openapi = {
	path: '/tab/tourns/{tournId}/sites',
	summary: 'Create site',
	tags: ['Sites & Rooms'],
};

router.route('/:siteId').get(   requireAccess('tourn', 'read'),  controller.getSite).openapi = {
	path: '/tab/tourns/{tournId}/sites/{siteId}',
	summary: 'Get site',
	tags: ['Sites & Rooms'],
	responses: {
		200: {
			description: 'A site object',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/SiteResponse' },
					examples: {
						site: {
							summary: 'Example response',
							value: {
								id: 1,
								name: 'Lincoln High School',
								online: false,
								directions: '123 Main St, Anytown, USA',
								dropoff: 'Use the side entrance on 2nd Ave.',
								hostId: 5,
								circuitId: 2,
								createdAt: '2023-01-01T00:00:00Z',
								updatedAt: '2023-01-02T00:00:00Z',
							},
						},
					},
				},
			},
		},
	},
};

router.route('/:siteId').put(   requireAccess('tourn', 'write'), controller.updateSite).openapi = {
	path: '/tab/tourns/{tournId}/sites/{siteId}',
	summary: 'Update site',
	tags: ['Sites & Rooms'],
};

router.route('/:siteId').delete(requireAccess('tourn', 'write'), controller.deleteSite).openapi = {
	path: '/tab/tourns/{tournId}/sites/{siteId}',
	summary: 'Delete site',
	tags: ['Sites & Rooms'],
};

router.route('/:siteId/rooms').get( requireAccess('tourn', 'read'),  controller.getRooms).openapi = {
	path: '/tab/tourns/{tournId}/sites/{siteId}/rooms',
	summary: 'Get rooms',
	tags: ['Sites & Rooms'],
};

router.route('/:siteId/rooms').post(requireAccess('tourn', 'write'), controller.createRoom).openapi = {
	path: '/tab/tourns/{tournId}/sites/{siteId}/rooms',
	summary: 'Create room',
	tags: ['Sites & Rooms'],
};

router.route('/:siteId/rooms/:roomId').get(   requireAccess('tourn', 'read'),  controller.getRoom).openapi = {
	path: '/tab/tourns/{tournId}/sites/{siteId}/rooms/{roomId}',
	summary: 'Get room',
	tags: ['Sites & Rooms'],
};

router.route('/:siteId/rooms/:roomId').put(   requireAccess('tourn', 'write'), controller.updateRoom).openapi = {
	path: '/tab/tourns/{tournId}/sites/{siteId}/rooms/{roomId}',
	summary: 'Update room',
	tags: ['Sites & Rooms'],
};

router.route('/:siteId/rooms/:roomId').delete(requireAccess('tourn', 'write'), controller.deleteRoom).openapi = {
	path: '/tab/tourns/{tournId}/sites/{siteId}/rooms/{roomId}',
	summary: 'Delete room',
	tags: ['Sites & Rooms'],
};

export default router;