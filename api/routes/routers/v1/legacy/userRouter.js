import { Router } from 'express';

import {
	userChaptersByTourn,
	userChapters,
} from '../../../../controllers/user/chapter/index.js';

import {
	getMySchoolsByTourn,
	getMyChaptersNonTourn,
} from '../../../../controllers/user/chapter/school.js';

import getProfileMod from '../../../../controllers/user/person/getProfile.js';
import acceptPayPalMod from '../../../../controllers/user/enter/acceptPayPal.js';
import processAuthorizeNetMod from '../../../../controllers/user/enter/processAuthorizeNet.js';
import updateLastAccess from '../../../../controllers/user/person/access.js';
import updateLearnCoursesMod from '../../../../controllers/user/person/learnCourse.js';

import inboxRouter from '../user/inboxRouter.ts';
import tournRouter from '../user/tournRouter.ts';
import sessionRouter from '../user/sessionRouter.ts';
import judgesRouter from '../user/judgesRouter.ts';

const router = Router();

// Helper to extract function from controller object if needed
function extractHandler(mod, method) {
	if (typeof mod === 'function') return mod;
	if (mod && typeof mod[method] === 'function') return mod[method];
	return (req, res) => res.status(501).json({ error: 'Not implemented' });
}

// Non legacy things

//User inbox
router.use('/tourn', tournRouter);
//User inbox
router.use('/inbox', inboxRouter);
//sessions
router.use('/session', sessionRouter);
router.use('/judges', judgesRouter);
// User session/profile/payment/learn

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
