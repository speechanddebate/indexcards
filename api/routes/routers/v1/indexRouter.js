import { Router } from 'express';
import { fileURLToPath } from 'node:url';

import authRouter from './authRouter.js';
import adminRouter from './admin/adminRouter.js';
import extRouter from './ext/extRouter.js';
import pagesRouter from './pages/pagesRouter.js';
import tabRouter from './tab/indexRouter.js';
import restRouter from './rest/restRouter.js';
import { apiReference } from '@scalar/express-api-reference';

// needed for monitoring and testing
import statusRouter from './admin/statusRouter.js';

import legacyUserRouter from './legacy/userRouter.js';
import legacyCoachRouter from './legacy/coachRouter.js';
import legacyPublicRouter from './legacy/public/indexRouter.js';
import { requireLogin, requireSiteAdmin } from '../../../middleware/authorization/authorization.js';
import { config } from '../../../../config/config.js';

const router = Router({ mergeParams: true });

// hide in progress endpoints behind a flag, so that we don't have to worry about them
if (!config.HIDE_DEV_ENDPOINTS || process.env.NODE_ENV === 'test') {
	router.use('/coach' , legacyCoachRouter);
	router.use('/tab'   , tabRouter);
	router.use('/admin' ,requireSiteAdmin, adminRouter);
	router.use('/ext'   , extRouter);
}

router.use('/pages' , pagesRouter);
router.use('/rest'  , restRouter);
router.use('/status' , statusRouter);
router.use('/auth'  , authRouter);
router.use('/public' , legacyPublicRouter);
router.use('/user'   ,requireLogin, legacyUserRouter);

// Serve pre-built OpenAPI spec
const openApiPath = fileURLToPath(new URL('../../openapi/openapi.json', import.meta.url));

router.get('/', (req, res) => {
	res.sendFile(openApiPath);
});

router.use(
	'/reference',
	apiReference({
		url: '/v1',
		orderSchemaPropertiesBy: 'preserve',
		persistAuth: true,
		showOperationId: true,
		metaData: {
			title: 'Tabroom.com API Reference',
		},
	}),
);

export default router;