import { assert } from 'chai';
import { Authenticate } from '../middleware/authentication.js';
import config from '../../config/config';
import { tabAuth } from './auth';
import userData from '../../tests/testFixtures';

describe('Authorization Functions', () => {

	it('Permits an ordinary user access to a tournament it is admin for', async () => {

		const testTourn = userData.testUserTournPerm.tourn;

		const req = {
			config,
			params: {
				tournId : testTourn,
			},
			cookies : {
				[config.COOKIE_NAME]: userData.testUserSession.userkey,
			},
		};
		const res = {};
		// Call the middleware to set req.session
		await new Promise((resolve, reject) => {
			Authenticate(req, res, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});

		req.session = await tabAuth(req);

		assert.typeOf(req.session, 'object');
		assert.typeOf(req.session.perms, 'object');
		assert.typeOf(req.session.tourn, 'object');
		assert.equal(req.session.perms.tourn[testTourn], 'tabber');

	});

	it('Denies user access to a tournament it is not admin for', async () => {

		const testNotTourn = '9700';

		const req = {
			config,
			params: {
				tournId : testNotTourn,
			},
			cookies : {
				[config.COOKIE_NAME]: userData.testUserSession.userkey,
			},
		};

		const res = {};
		// Call the middleware to set req.session
		await new Promise((resolve, reject) => {
			Authenticate(req, res, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
		req.session = await tabAuth(req);

		assert.typeOf(req.session, 'object');
		assert.isEmpty(req.session?.perms?.tourn);
	});

	it('Finds a session for an GLP Admin user', async () => {
		const req = {
			config,
			cookies : {
				[config.COOKIE_NAME]: userData.testAdminSession.userkey,
			},
		};

		const res = {};
		// Call the middleware to set req.session
		await new Promise((resolve, reject) => {
			Authenticate(req, res, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});

		const session = req.session;

		assert.typeOf(session, 'object');
		assert.equal(session.person, '70');
		assert.equal(session.site_admin, true);
		assert.equal(session.email, 'i.am.god@speechanddebate.org');
	});

	it('Permits GLP admin access to a tournament it is not admin for', async () => {

		const testNotTourn = '9700';

		const req = {
			config,
			params: {
				tournId : testNotTourn,
			},
			cookies : {
				[config.COOKIE_NAME]: userData.testAdminSession.userkey,
			},
		};

		const res = {};
		// Call the middleware to set req.session
		await new Promise((resolve, reject) => {
			Authenticate(req, res, (err) => {
				if (err) reject(err);
				else resolve();
			});
		});
		req.session = await tabAuth(req);

		assert.typeOf(req.session, 'object');
		assert.equal(req.session.perms.tourn[testNotTourn], 'owner');
	});

});
