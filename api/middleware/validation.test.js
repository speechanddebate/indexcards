
import express from 'express';
import z from 'zod';
import request from 'supertest';
import bodyParser from 'body-parser';

async function makeApp() {
	vi.resetModules();

	const { ValidateRequest } = await import('./validation.js');

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

describe('validateBodies', () => {

	it('validates request bodies', async () => {
		const app = await makeApp();

		const res = await request(app)
		.get('/v1/test/123?queryValue=string')
		.send({value: 'testValue'});

		expect(res).not.toBeProblemResponse();
	});
	it('fails when request body is invalid', async () => {
		const app = await makeApp();

		const res = await request(app).
		get('/v1/test/123?queryValue=string')
		.send().expect(400);

		expect(res).toBeProblemResponse();
	});
	it('fails when request params are invalid', async () => {
		const app = await makeApp();

		const res = await request(app)
		.get('/v1/test/0?queryValue=string')
		.send({value: 'testValue'})
		.expect(400);

		expect(res).toBeProblemResponse();
	});
});
