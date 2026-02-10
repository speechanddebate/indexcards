/* eslint-disable jest/no-disabled-tests */
import { assert } from 'chai';
import request from 'supertest';
import config from '../../../../../config/config.js';
import db from '../../../../data/db.js';
import server from '../../../../../app.js';
import { testUserAPIKey, testStoreCartSetting } from '../../../../../tests/testFixtures.js';

const authHeader = Buffer.from(`69:${testUserAPIKey.value}`).toString('base64');

describe('Person History', () => {

	it('Returns history for a person', async () => {

		// Victim of the day!
		const res = await request(server)
			.get(`/v1/ext/nsda/history?nsda_id=123456`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');
		assert.property(res.body, 'personId', 'Response has personId property');
		assert.property(res.body, 'student', 'Response has student property');
		assert.property(res.body, 'judge', 'Response has judge property');
		assert.property(res.body, 'quizzes', 'Response has quizzes property');
		assert.equal(res.body.personId, '123215', 'Returned the proper NSDA ID for the end user');

	}, 30000);

	it('Errors on a missing person id', async () => {
		const test = await request(server)
			.get(`/v1/ext/nsda/history?nsda_id=999999999`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.expect('Content-Type', /json/)
			.expect(404);
	}, 30000);
});

describe.skip('Payment Gateway', () => {

	let testTourn = {};

	beforeAll(async () => {
		testTourn = await db.summon(db.tourn, 1);
		await db.setting(testTourn, 'store_carts', { json: testStoreCartSetting });
		// NEED to define a test user here with a test API key for the below auth
	});

	it('Posts a payment into a tournament', async () => {

		const hashDigest = Buffer.from(`1:testAPIKEY}`).toString('base64');

		await request(server)
			.post(`/v1/ext/nsda/payment`)
			.set('Accept', 'application/json')
			.set('Authorization', `Basic ${authHeader}`)
			.send({
				tourn_id   : 1,
				invoice_id : '1234567890abcdef-1',
				hash_key   : hashDigest,
				items      : {
					[config.NSDA.PRODUCT_CODES.tabroom] : 10,
					[config.NSDA.PRODUCT_CODES.nc] : 20,
					[config.NSDA.PRODUCT_CODES.nco] : 30,
				},
			})
			.expect('Content-Type', /json/)
			.expect(201);

		const tourn = await db.summon(db.tourn, 1);

		assert.typeOf(tourn, 'object');
		assert.typeOf(tourn.settings, 'object');
		assert.typeOf(tourn.settings.store_carts, 'object');

		assert.equal(tourn.settings.store_carts[1].tabroom, 10);
		assert.equal(tourn.settings.store_carts[1].nc, 20);
		assert.equal(tourn.settings.store_carts[1].nco, 30);
		assert.equal(tourn.settings.store_carts[1].cart_id, '1234567890abcdef');
	});

	afterAll(async () => {
		await db.setting(testTourn, 'store_carts', 0);
	});
});