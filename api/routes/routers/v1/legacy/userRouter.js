
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
import updateLastAccessMod from '../../../../controllers/user/person/access.js';
import updateLearnCoursesMod from '../../../../controllers/user/person/learnCourse.js';

const router = Router();

// Helper to extract function from controller object if needed
function extractHandler(mod, method) {
	if (typeof mod === 'function') return mod;
	if (mod && typeof mod[method] === 'function') return mod[method];
	return (req, res) => res.status(501).json({ error: 'Not implemented' });
}

// User chapters
router.get('/chapter', userChapters);
router.get('/chapter/byTourn/:tournId', userChaptersByTourn);
router.get('/chapter/byTourn/:tournId/mySchools', getMySchoolsByTourn);
router.get('/chapter/byTourn/:tournId/nonSchools', getMyChaptersNonTourn);

// User push notifications
router.post('/push/:subscriptionId/:subStatus', pushSubscribe);
router.get('/push/show/:tabroomId/:subscriptionId', getSubscribe);
router.post('/push/sync', pushSync);
router.route('/push/find')
	.get(getSubscription)
	.delete(deleteSubscription);

// Judge routes
router.get('/judge/:judgeId/active', checkActive);
router.post('/judge/:judgeId/ballot/rubric', saveRubric);
router.get('/judge/:judgeId/section/:sectionId/checkBallotAccess', checkBallotAccess);
router.get('/judge/:judgeId/section/:sectionId/getBallotSides', getBallotSides);

// User tourn presence
router.get('/tourn/:tournId', getPersonTournPresence);

// User inbox
router.get('/inbox/list', extractHandler(inboxList, 'GET'));
router.get('/inbox/unread', extractHandler(unreadCount, 'GET'));
router.post('/inbox/markRead', extractHandler(markMessageRead, 'POST'));
router.post('/inbox/markAllRead', extractHandler(markAllMessagesRead, 'POST'));
router.post('/inbox/markDeleted', extractHandler(markMessageDeleted, 'POST'));

// User session/profile/payment/learn
router.get('/session', extractHandler(getSessionMod, 'GET'));
router.get('/profile', extractHandler(getProfileMod, 'GET'));
router.get('/profile/:personId', extractHandler(getProfileMod, 'GET'));
router.post('/enter/paypal', extractHandler(acceptPayPalMod, 'POST'));
router.post('/enter/authorize', extractHandler(processAuthorizeNetMod, 'POST'));
router.post('/updateLastAccess', extractHandler(updateLastAccessMod, 'GET'));
router.post('/updateLearn', extractHandler(updateLearnCoursesMod, 'GET'));
router.post('/updateLearn/:personId', extractHandler(updateLearnCoursesMod, 'GET'));

export default router;
