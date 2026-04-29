import { Router } from 'express';
import * as c from '../../../../controllers/user/inbox.js';
import { requireLogin } from '../../../../middleware/authorization/authorization.js';
import { InboxMessage } from '../../../openapi/schemas/Message.js';
import z from 'zod';
import * as utils from '../../../openapi/schemas/utils.js';
import { ValidateRequest } from '../../../../middleware/validation.js';

const router = Router();

router.use(requireLogin);

router.route('/').get(c.inboxList).openapi = {
	path: '/user/inbox',
	operationId: 'UserInbox',
	summary: 'Get messages',
	description: 'Get the list of messages for the logged-in user',
	tags: ['Orval','Inbox'],
	responses: {
		200: {
			description: 'Inbox list',
			content: {
				'application/json': {
					schema:  z.array(InboxMessage),
				},
			},
		},
	},
};
router.route('/unread').get(c.getUnreadCount).openapi = {
	path: '/user/inbox/unread',
	summary: 'Unread count',
	description: 'Get the count of unread messages for the logged-in user',
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

router.route('/markAllRead').post(c.readAllMessages).openapi = {
	path: '/user/inbox/markAllRead',
	operationId: 'UserInboxMarkAllRead',
	summary: 'Mark all messages as read',
	description: 'Mark all visible messages for the logged-in user as read',
	tags: ['Orval', 'Inbox'],
	responses: { 204: { description: 'All messages marked as read' } },
};
router.route('/:messageId')
	.get(ValidateRequest, c.getMessage)
	.delete(ValidateRequest, c.deleteMessage).openapi = {
		path: '/user/inbox/{messageId}',
		tags: ['Orval', 'Inbox'],
		requestParams: {
			path: z.object({
				messageId: utils.id.meta({ description: 'The ID of the message' }),
			}),
		},
		get: {
			operationId: 'UserInboxGetMessage',
			summary: 'Get message',
			description: 'Get a specific message from the users inbox',
			responses: {
				200: {
					description: 'Inbox message',
					content: {
						'application/json': {
							schema: InboxMessage,
						},
					},
				},
			},
		},
		delete: {
			operationId: 'UserInboxMarkDeleted',
			summary: 'Delete message',
			description: 'Delete a specific message from the users inbox',
			responses: { 204: { description: 'Message marked as deleted' } },
		},
	};

router.route('/:messageId/markRead').post(ValidateRequest, c.readMessage).openapi = {
	path: '/user/inbox/{messageId}/markRead',
	operationId: 'UserInboxMarkRead',
	summary: 'Mark message as read',
	description: 'Mark a specific message as read',
	tags: ['Orval', 'Inbox'],
	requestParams: {
		path: z.object({
			messageId: utils.id.meta({ description: 'The ID of the message to mark as read' }),
		}),
	},
	responses: { 204: { description: 'Message marked as read' } },
};

router.route('/:messageId/markUnread').post(ValidateRequest, c.unreadMessage).openapi = {
	path: '/user/inbox/{messageId}/markUnread',
	operationId: 'UserInboxMarkUnread',
	summary: 'Mark message as unread',
	description: 'Mark a specific message as unread',
	tags: ['Orval', 'Inbox'],
	requestParams: {
		path: z.object({
			messageId: utils.id.meta({ description: 'The ID of the message to mark as unread' }),
		}),
	},
	responses: { 204: { description: 'Message marked as unread' } },
};
export default router;