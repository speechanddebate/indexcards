import { Router } from 'express';
import authRouter from './authRouter.js';
import adminRouter from './admin/adminRouter.js';
import extRouter from './ext/extRouter.js';
import restRouter from './rest/restRouter.js';
import { createOpenApiSpec } from '../../openapi/createOpenApiSpec.js';
import swaggerUI from 'swagger-ui-express';

const router = Router();

router.use('/auth',authRouter);
router.use('/admin',adminRouter);
router.use('/ext', extRouter);
router.use('/rest',restRouter);

const openApiSpec = createOpenApiSpec(router);

router.get('/', (req, res) => res.json(openApiSpec));
// Swagger UI interface for the API
router.use('/swagger', swaggerUI.serve, swaggerUI.setup(openApiSpec));

export default router;