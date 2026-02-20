import { Router } from 'express';
import { fileURLToPath } from 'node:url';

import authRouter from './authRouter.js';
import adminRouter from './admin/adminRouter.js';
import extRouter from './ext/extRouter.js';
import pagesRouter from './pages/pagesRouter.js';
import tabRouter from './tab/indexRouter.js';
import restRouter from './rest/restRouter.js';
import { apiReference } from '@scalar/express-api-reference';

import legacyUserRouter from './legacy/userRouter.js';
import legacyCoachRouter from './legacy/coachRouter.js';
import legacyPublicRouter from './legacy/public/indexRouter.js';

const router = Router({ mergeParams: true });

router.use('/auth',authRouter);
router.use('/admin',adminRouter);
router.use('/ext', extRouter);
router.use('/pages', pagesRouter);
router.use('/tab',tabRouter);
router.use('/rest',restRouter);

router.use('/public',legacyPublicRouter);
router.use('/user',legacyUserRouter);
router.use('/coach',legacyCoachRouter);

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
		metaData: {
			title: 'Tabroom.com API Reference',
		},
	}),
);

export default router;