import request from 'supertest';
import { assert } from 'chai';
import db from '../../../data/db';
import config from '../../../../config/config';
import server from '../../../../app';
import { testUserSession } from '../../../../tests/testFixtures';
import { beforeAll } from 'vitest';

describe('Session Last Access Updated', () => {

	beforeAll( async () => {
		await db.sequelize.query(`
			update session
				set last_access = '2024-01-01 00:00:00'
				where person = :personId
		`, {
			replacements: { personId: testUserSession.person },
			type: db.Sequelize.QueryTypes.UPDATE,
		});
	});

	it('Updates Last Access Timestamp', async () => {

		const update = await request(server)
			.get(`/v1/user/updateLastAccess?forceUpdate=1`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		let res = {};

		if (update) {
			res = await request(server)
				.get(`/v1/user/session`)
				.set('Accept', 'application/json')
				.set('Cookie', [`${config.COOKIE_NAME}=${testUserSession.userkey}`])
				.expect('Content-Type', /json/)
				.expect(200);
		}

		assert.isObject(res.body, 'Response is an object');

		assert.equal(
			res.body.person,
			69,
			'Correct User Session Returned'
		);

		const lastAccess = new Date(res.body.last_access);

		assert.equal(
			lastAccess.toDateString,
			new Date().toDateString,
			'Last Access date is set to present day'
		);
	});
});
