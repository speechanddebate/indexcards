
import { Router } from 'express';
import {
	userChaptersByTourn,
	userChapters,
} from '../../../../controllers/user/chapter/index.js';
import {
	getMySchoolsByTourn,
	getMyChaptersNonTourn,
} from '../../../../controllers/user/chapter/school.js';
import { getSubscribe, pushSubscribe, pushSync } from '../../../../controllers/user/person/notifications.js';
import { getSubscription, deleteSubscription } from '../../../../controllers/user/blast.js';
import { checkBallotAccess, checkActive, getBallotSides, saveRubric } from '../../../../controllers/user/judge/ballot.js';
import { getPersonTournPresence } from '../../../../controllers/user/tourn/index.js';
import { inboxList, unreadCount, markMessageRead, markAllMessagesRead, markMessageDeleted } from '../../../../controllers/user/inbox.js';
import getSessionMod from '../../../../controllers/user/person/session.js';
import getProfileMod from '../../../../controllers/user/person/getProfile.js';
import acceptPayPalMod from '../../../../controllers/user/enter/acceptPayPal.js';
import processAuthorizeNetMod from '../../../../controllers/user/enter/processAuthorizeNet.js';
import updateLastAccess from '../../../../controllers/user/person/access.js';
import updateLearnCoursesMod from '../../../../controllers/user/person/learnCourse.js';

const router = Router();

// Helper to extract function from controller object if needed
function extractHandler(mod, method) {
	if (typeof mod === 'function') return mod;
	if (mod && typeof mod[method] === 'function') return mod[method];
	return (req, res) => res.status(501).json({ error: 'Not implemented' });
}

// User chapters
router.get('/chapter', userChapters).openapi = {
	path: '/user/chapter',
	tags: ['legacy', 'User Chapters'],
	responses: { 200: { description: 'User chapters' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/chapter/byTourn/:tournId', userChaptersByTourn).openapi = {
	path: '/user/chapter/byTourn/{tournId}',
	tags: ['legacy', 'User Chapters'],
	parameters: [{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Chapters by tournament' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/chapter/byTourn/:tournId/mySchools', getMySchoolsByTourn).openapi = {
	path: '/user/chapter/byTourn/{tournId}/mySchools',
	tags: ['legacy', 'User Chapters'],
	parameters: [{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'My schools by tournament' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/chapter/byTourn/:tournId/nonSchools', getMyChaptersNonTourn).openapi = {
	path: '/user/chapter/byTourn/{tournId}/nonSchools',
	tags: ['legacy', 'User Chapters'],
	parameters: [{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Non-school chapters by tournament' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

// User push notifications
router.post('/push/:subscriptionId/:subStatus', pushSubscribe).openapi = {
	path: '/user/push/{subscriptionId}/{subStatus}',
	tags: ['legacy', 'Push Notifications'],
	parameters: [
		{ in: 'path', name: 'subscriptionId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'subStatus', required: true, schema: { type: 'string' } },
	],
	responses: { 200: { description: 'Subscription updated' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/push/show/:tabroomId/:subscriptionId', getSubscribe).openapi = {
	path: '/user/push/show/{tabroomId}/{subscriptionId}',
	tags: ['legacy', 'Push Notifications'],
	parameters: [
		{ in: 'path', name: 'tabroomId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'subscriptionId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Subscription details' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/push/sync', pushSync).openapi = {
	path: '/user/push/sync',
	tags: ['legacy', 'Push Notifications'],
	responses: { 200: { description: 'Sync completed' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/push/find').get(getSubscription).openapi = {
	path: '/user/push/find',
	tags: ['legacy', 'Push Notifications'],
	responses: { 200: { description: 'Subscription' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.route('/push/find').delete(deleteSubscription).openapi = {
	path: '/user/push/find',
	tags: ['legacy', 'Push Notifications'],
	responses: { 200: { description: 'Subscription deleted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

// Judge routes
router.get('/judge/:judgeId/active', checkActive).openapi = {
	path: '/user/judge/{judgeId}/active',
	tags: ['legacy', 'Judge'],
	parameters: [{ in: 'path', name: 'judgeId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Judge active status' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/judge/:judgeId/ballot/rubric', saveRubric).openapi = {
	path: '/user/judge/{judgeId}/ballot/rubric',
	tags: ['legacy', 'Judge'],
	parameters: [{ in: 'path', name: 'judgeId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Rubric saved' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/judge/:judgeId/section/:sectionId/checkBallotAccess', checkBallotAccess).openapi = {
	path: '/user/judge/{judgeId}/section/{sectionId}/checkBallotAccess',
	tags: ['legacy', 'Judge'],
	parameters: [
		{ in: 'path', name: 'judgeId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'sectionId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Ballot access check' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/judge/:judgeId/section/:sectionId/getBallotSides', getBallotSides).openapi = {
	path: '/user/judge/{judgeId}/section/{sectionId}/getBallotSides',
	tags: ['legacy', 'Judge'],
	parameters: [
		{ in: 'path', name: 'judgeId', required: true, schema: { type: 'integer' } },
		{ in: 'path', name: 'sectionId', required: true, schema: { type: 'integer' } },
	],
	responses: { 200: { description: 'Ballot sides' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

// User tourn presence
router.get('/tourn/:tournId', getPersonTournPresence).openapi = {
	path: '/user/tourn/{tournId}',
	tags: ['legacy', 'User Tournament'],
	parameters: [{ in: 'path', name: 'tournId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Person tournament presence' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

// User inbox
router.get('/inbox/list', extractHandler(inboxList, 'GET')).openapi = {
	path: '/user/inbox/list',
	tags: ['legacy', 'Inbox'],
	responses: { 200: { description: 'Inbox list' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/inbox/unread', extractHandler(unreadCount, 'GET')).openapi = {
	path: '/user/inbox/unread',
	tags: ['legacy', 'Inbox'],
	responses: { 200: { description: 'Unread count' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/inbox/markRead', extractHandler(markMessageRead, 'POST')).openapi = {
	path: '/user/inbox/markRead',
	tags: ['legacy', 'Inbox'],
	responses: { 200: { description: 'Message marked as read' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/inbox/markAllRead', extractHandler(markAllMessagesRead, 'POST')).openapi = {
	path: '/user/inbox/markAllRead',
	tags: ['legacy', 'Inbox'],
	responses: { 200: { description: 'All messages marked as read' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/inbox/markDeleted', extractHandler(markMessageDeleted, 'POST')).openapi = {
	path: '/user/inbox/markDeleted',
	tags: ['legacy', 'Inbox'],
	responses: { 200: { description: 'Message marked as deleted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

// User session/profile/payment/learn
router.get('/session', extractHandler(getSessionMod, 'GET')).openapi = {
	path: '/user/session',
	tags: ['legacy', 'User Session'],
	responses: { 200: { description: 'User session' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/profile', extractHandler(getProfileMod, 'GET')).openapi = {
	path: '/user/profile',
	tags: ['legacy', 'User Profile'],
	responses: { 200: { description: 'User profile' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/profile/:personId', extractHandler(getProfileMod, 'GET')).openapi = {
	path: '/user/profile/{personId}',
	tags: ['legacy', 'User Profile'],
	parameters: [{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'User profile' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/enter/paypal', extractHandler(acceptPayPalMod, 'POST')).openapi = {
	path: '/user/enter/paypal',
	tags: ['legacy', 'Payment'],
	responses: { 200: { description: 'PayPal accepted' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/enter/authorize', extractHandler(processAuthorizeNetMod, 'POST')).openapi = {
	path: '/user/enter/authorize',
	tags: ['legacy', 'Payment'],
	responses: { 200: { description: 'Authorize.Net processed' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.get('/updateLastAccess', updateLastAccess).openapi = {
	path: '/user/updateLastAccess',
	tags: ['legacy', 'User'],
	responses: { 200: { description: 'Access updated' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/updateLearn', extractHandler(updateLearnCoursesMod, 'GET')).openapi = {
	path: '/user/updateLearn',
	tags: ['legacy', 'Learn'],
	responses: { 200: { description: 'Learn courses updated' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};
router.post('/updateLearn/:personId', extractHandler(updateLearnCoursesMod, 'GET')).openapi = {
	path: '/user/updateLearn/{personId}',
	tags: ['legacy', 'Learn'],
	parameters: [{ in: 'path', name: 'personId', required: true, schema: { type: 'integer' } }],
	responses: { 200: { description: 'Learn courses updated' }, default: { $ref: '#/components/responses/ErrorResponse' } },
};

export default router;
