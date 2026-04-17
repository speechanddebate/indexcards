
import express from 'express';
import z from 'zod';
import request from 'supertest';
import bodyParser from 'body-parser';
import { ValidateRequest } from './validation.js';
import { createContext } from '../../tests/httpMocks.ts';

function createValidationContext(){
	return createContext({
		req: {
			params: {
				value: 'test',
			},
			query:{
				value: 'test',
			},
			body: {
				value: 'test',
			},
			route:{
				openapi: {
					requestParams: {
						query: z.object({
							value: z.string(),
						}),
						path: z.object({
							value: z.string(),
						}),
					},
					requestBody: {
						required: true,
						content: {
							'application/json': {
								schema: z.object({
									value: z.string(),
								}),
							},
						},
					},
				},
			},
		},
	});
}
async function makeApp() {
	vi.resetModules();

	const app = express();
	app.use(bodyParser.json());

	const params = {
		path: z.object({
			paramValue: z.coerce.number().positive(),
		}),
		query: z.object({
			queryValue: z.string(),
		}),
	};

	app.route('/v1/test/:paramValue').get(ValidateRequest, (req, res) => res.json({ ok: true })).openapi = {
		requestParams: params,
		requestBody: {
			required: true,
			content: {
				'application/json': {
					schema: z.object({
						value: z.string(),
					}),
				},
			},
		},
	};

	return app;
}

async function makeMethodSpecificOpenApiApp() {
	vi.resetModules();

	const app = express();
	app.use(bodyParser.json());

	const route = app.route('/v1/test-method/:paramValue');
	route.get(ValidateRequest, (req, res) => res.json({ ok: true }));
	route.post(ValidateRequest, (req, res) => res.json({ ok: true }));
	route.openapi = {
		requestParams: {
			path: z.object({
				paramValue: z.coerce.number().positive(),
			}),
		},
		get: {
			requestParams: {
				query: z.object({
					queryValue: z.string(),
				}),
			},
		},
		post: {
			requestBody: {
				required: true,
				content: {
					'application/json': {
						schema: z.object({
							value: z.string(),
						}),
					},
				},
			},
		},
	};

	return app;
}

describe('ValidateRequest', () => {
	it('validates the request and attaches valid data to req.valid', async () => {
		const { req, res } = createValidationContext();
		await ValidateRequest(req, res, () => {});
		expect(req.valid).toEqual({
			params: {
				value: 'test',
			},
			query: {
				value: 'test',
			},
			body: {
				value: 'test',
			},
		});
	});
	it('returns a 400 error when validation fails', async () => {
		let { req, res } = createValidationContext();
		req.body.value = 123; // Invalid value
		await ValidateRequest(req, res, () => {});
		expect(res).toBeProblemResponse(400);
		({ req, res } = createValidationContext());
		req.params.value = 123; // Invalid value
		await ValidateRequest(req, res, () => {});
		expect(res).toBeProblemResponse(400);
		({ req, res } = createValidationContext());
		req.query.value = 123; // Invalid value
		await ValidateRequest(req, res, () => {});
		expect(res).toBeProblemResponse(400);
	});
	it('validates correct requests', async () => {
		const app = await makeApp();

		const res = await request(app)
		.get('/v1/test/123?queryValue=string')
		.send({value: 'testValue'});
		expect(res).not.toBeProblemResponse();
	});

	it('validates method-specific OpenAPI schemas on shared routes', async () => {
		const app = await makeMethodSpecificOpenApiApp();

		const getRes = await request(app)
			.get('/v1/test-method/10?queryValue=ok');
		expect(getRes).not.toBeProblemResponse();

		const badGetRes = await request(app)
			.get('/v1/test-method/10');
		expect(badGetRes).toBeProblemResponse(400);

		const postRes = await request(app)
			.post('/v1/test-method/10')
			.send({ value: 'ok' });
		expect(postRes).not.toBeProblemResponse();

		const badPostRes = await request(app)
			.post('/v1/test-method/10')
			.send({ value: 123 });
		expect(badPostRes).toBeProblemResponse(400);
	});
});
