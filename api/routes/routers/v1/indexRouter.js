import { Router } from 'express';
import authRouter from './authRouter.js';
import adminRouter from './admin/adminRouter.js';
import extRouter from './ext/extRouter.js';
import pagesRouter from './pages/pagesRouter.js';
import restRouter from './rest/restRouter.js';
import { createOpenApiSpec } from '../../openapi/createOpenApiSpec.js';
import { apiReference } from '@scalar/express-api-reference';

const router = Router();

router.use('/auth',authRouter);
router.use('/admin',adminRouter);
router.use('/ext', extRouter);
router.use('/pages', pagesRouter);
router.use('/rest',restRouter);

const openApiSpec = createOpenApiSpec(router);

router.get('/', (req, res) => res.json(openApiSpec));

router.use(
	'/reference',
	apiReference({
		url: '/v1',
	}),
);

export default router;