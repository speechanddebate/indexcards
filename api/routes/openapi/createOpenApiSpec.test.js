import { Router } from 'express';
import { collectOpenApi } from './createOpenApiSpec';
describe('collectOpenApi', () => {
	it('should collect OpenAPI metadata from .route form', () => {
		const router = Router();
		router.route('/foo').get((req, res) => {
			res.send('ok');
		}).openapi = {
			path: '/foo',
			operationId: 'Foo',
			summary: '/foo',
		};

		const result = collectOpenApi(router);

		expect(result.paths['/foo']['get']).toBeDefined();
		expect(result.paths['/foo']['get'].operationId).toBe('Foo');
		expect(result.paths['/foo']['get'].summary).toBe('/foo');
	});
	it('should collect OpenAPI metadata from nested routers', () => {
		const router = Router();
		const childRouter = Router();
		childRouter.route('/bar').get((req, res) => {
			res.send('ok');
		}).openapi = {
			path: '/bar',
			summary: '/bar',
		};
		router.use('/child', childRouter);

		const result = collectOpenApi(router);

		expect(result.paths['/bar']['get']).toBeDefined();
		expect(result.paths['/bar']['get'].summary).toBe('/bar');
	});

	it('should collect method-specific OpenAPI metadata from a shared route', () => {
		const router = Router();
		const shared = router.route('/item/:id');
		shared.get((req, res) => res.send('ok'));
		shared.delete((req, res) => res.send('ok'));

		shared.openapi = {
			path: '/item/{id}',
			requestParams: {
				path: {},
			},
			get: {
				operationId: 'GetItem',
				summary: 'get item',
			},
			delete: {
				operationId: 'DeleteItem',
				summary: 'delete item',
			},
		};

		const result = collectOpenApi(router);

		expect(result.paths['/item/{id}']['get'].operationId).toBe('GetItem');
		expect(result.paths['/item/{id}']['delete'].operationId).toBe('DeleteItem');
	});
});