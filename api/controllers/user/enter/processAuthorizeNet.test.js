import request from 'supertest';
import { assert } from 'chai';
import server from '../../../../app';

describe.todo('Authorize.net', () => {
	it('Processes an authorize.net payment', async () => {
		const body = {
			tourn: 24674,
			tourn_name: 'Share Test',
			school: 13811,
			school_name: 'Hardy Test',
			person_first: 'Test',
			person_last: 'Test',
			customerInformation: {
				firstName: 'Test',
				lastName: 'User',
			},
			opaqueData: {
				dataDescriptor: 'COMMON.ACCEPT.INAPP.PAYMENT',
				dataValue: 'eyJjb2RlIjoiNTBfMl8wNjAwMDUzQTIxMjNDNDU1NTZDNzA1MTE0NkZCNUVBM0E4NTM3OUY2RDRDNzk4MTZBMjNENjUxMzg2M0Y0RjNERkM4RTY4Q0UxN0QwMTNFODU2N0FFRTA5MjMxQjcxMEEzM0QyNzRBIiwidG9rZW4iOiI5NzAwNTg3MTA4MDM2Njc5ODA0NjAxIiwidiI6IjEuMSJ9',
			},
			encryptedCardData: {},
			base: 10,
		};
		const res = await request(server)
			.post(`/v1/user/enter/authorize`)
			.set('Accept', 'application/json')
			.send(body)
			.expect('Content-Type', /json/)
			.expect(200);

		assert.isObject(res.body, 'Response is an object');
	}, 30000);
});
