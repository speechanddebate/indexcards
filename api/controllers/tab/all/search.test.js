import { assert } from 'chai';
import request from 'supertest';
import server from '../../../../app';
import db from '../../../helpers/db';
import config from '../../../../config/config';
import { testAdminSession }  from '../../../../tests/testFixtures';

describe('Attendee Search Function', () => {

	let adminSession = {};

	beforeAll(async () => {
		adminSession = await db.session.findByPk(testAdminSession.id);
	});

	it('Searches for tournament attendees by name', async () => {

		const searchNavy = 'Navy';

		// I may have overly committed to the bit there

		const manOverboard = await request(server)
			.get(`/v1/tab/29774/search/${searchNavy}`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${adminSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		const lifePreserver = manOverboard.body;

		assert.typeOf(lifePreserver, 'object', 'Object returned');
		assert.typeOf(lifePreserver.exactMatches, 'array', 'Array of exact matches found');
		assert.typeOf(lifePreserver.partialMatches, 'array', 'Array of partial matches found');

		assert.typeOf(lifePreserver.partialMatches[0].id, 'number', 'ID of partial match is a number');
		assert.typeOf(lifePreserver.partialMatches[0].name, 'string', 'Name of partial match is a number');

		assert.typeOf(lifePreserver.exactMatches[0].id, 'number', 'ID of exact matches is a number');
		assert.equal(lifePreserver.exactMatches[0].id, 651034, 'Exact match ID is correct');
		assert.equal(lifePreserver.exactMatches[0].name, 'Navy', 'Exact match name is correct');
		assert.equal(lifePreserver.exactMatches[0].tag, 'school', 'Exact match tag is correct');

		assert.equal(lifePreserver.partialMatches[0].id, 1400939, 'Exact match ID is correct');
		assert.equal(lifePreserver.partialMatches[0].first, 'Jake', 'Partial match name is correct');
		assert.equal(lifePreserver.partialMatches[0].tag, 'entry', 'Exact match tag is correct');

		// Search for an individual in that same tournament and BONUS ROUND!
		// make sure the special character doesn't mess with us

		const searchDaisy = 'O\'Gorman';

		const resDVOG = await request(server)
			.get(`/v1/tab/29774/search/${searchDaisy}`)
			.set('Accept', 'application/json')
			.set('Cookie', [`${config.COOKIE_NAME}=${adminSession.userkey}`])
			.expect('Content-Type', /json/)
			.expect(200);

		assert.typeOf(resDVOG.body, 'object', 'Object returned');
		assert.typeOf(resDVOG.body.exactMatches, 'array', 'Array of exact matches found');
		assert.typeOf(resDVOG.body.partialMatches, 'array', 'Array of partial matches found');
		assert.equal(resDVOG.body.partialMatches.length, 0, 'Array of partial matches is empty');
		assert.equal(resDVOG.body.exactMatches[0].first, 'Danielle', 'Name match found for exact match');
		assert.equal(resDVOG.body.exactMatches[0].tag, 'judge', 'Exact match tag is correct');

	});
});
