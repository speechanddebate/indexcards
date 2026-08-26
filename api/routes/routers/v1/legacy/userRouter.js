import { Router } from 'express';

import getProfileMod from '../../../../controllers/user/person/getProfile.js';
import acceptPayPalMod from '../../../../controllers/user/enter/acceptPayPal.js';
import processAuthorizeNetMod from '../../../../controllers/user/enter/processAuthorizeNet.js';
import updateLastAccess from '../../../../controllers/user/person/access.js';
import updateLearnCoursesMod from '../../../../controllers/user/person/learnCourse.js';

import inboxRouter from '../user/inboxRouter.js';
import tournsRouter from '../user/tournsRouter.js';
import sessionRouter from '../user/sessionRouter.js';
import judgesRouter from '../user/judgesRouter.js';
import studentsRouter from '../user/studentsRouter.js';
import chaptersRouter from '../user/chaptersRouter.js';
import sectionsRouter from '../user/sectionsRouter.js';

const router = Router();

// Helper to extract function from controller object if needed
function extractHandler(mod, method) {
	if (typeof mod === 'function') return mod;
	if (mod && typeof mod[method] === 'function') return mod[method];
	return (req, res) => res.status(501).json({ error: 'Not implemented' });
}

// Non legacy things
//User inbox
router.use('/tourns', tournsRouter);
//User inbox
router.use('/inbox', inboxRouter);
//sessions
router.use('/session', sessionRouter);
router.use('/judges', judgesRouter);
router.use('/students', studentsRouter);
router.use('/chapters', chaptersRouter);
router.use('/sections', sectionsRouter);
// User session/profile/payment/learn

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
