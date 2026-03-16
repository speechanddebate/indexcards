import { Router } from 'express';
import { inboxList, getUnreadCount, markMessageRead, markAllMessagesRead, markMessageDeleted } from '../../../../controllers/user/inbox.js';
import { requireLogin } from '../../../../middleware/authorization/authorization.js';

const router = Router();

router.use(requireLogin);

router.route('/list').get(inboxList).openapi = {
	path: '/user/inbox/list',
	tags: ['legacy', 'Inbox'],
	responses: { 200: { description: 'Inbox list' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/unread').get(getUnreadCount).openapi = {
	path: '/user/inbox/unread',
	operationId: 'UserInboxUnread',
	tags: ['Inbox','Orval'],
	responses: {
		200: {
			description: 'Unread count',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							count: { type: 'integer' },
						},
					},
				},
			},
		},
	},
};
router.route('/markRead').post(markMessageRead).openapi = {
	path: '/user/inbox/markRead',
	tags: ['legacy', 'Inbox'],
	responses: { 200: { description: 'Message marked as read' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/markAllRead').post(markAllMessagesRead).openapi = {
	path: '/user/inbox/markAllRead',
	tags: ['legacy', 'Inbox'],
	responses: { 200: { description: 'All messages marked as read' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/markDeleted').post(markMessageDeleted).openapi = {
	path: '/user/inbox/markDeleted',
	tags: ['legacy', 'Inbox'],
	responses: { 200: { description: 'Message marked as deleted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

export default router;