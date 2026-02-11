//test for the timeslots endpoints
import request from 'supertest';
import app from '../../../../../../app.js';
import factories from '../../../../../../tests/factories/index.js';
import { testAdminSession } from '../../../../../../tests/testFixtures.js';
import { expectProblem } from '../../../../../../tests/utils.js';

let tournId = null;
let userkey = testAdminSession.userkey;

describe('Timeslots', () => {
	beforeAll(async () => {
		({tournId} = await factories.tourn.createTestTourn());
	});

	describe('POST /tourns/:tournId/timeslots', () => {
		it('creates a new timeslot with valid data', async () => {
			const timeslotData = factories.timeslot.createTimeslotData({ tournId });
			const response = await request(app)
				.post(`/v1/tab/tourns/${tournId}/timeslots`)
				.set('Authorization', `Bearer ${userkey}`)
				.send(timeslotData)
				.expect(201);
			expect(response.body).toBeDefined();
			expect(response.body.name).toBe(timeslotData.name);
			expect(new Date(response.body.start).getTime()).toBe(timeslotData.start.getTime());
			expect(new Date(response.body.end).getTime()).toBe(timeslotData.end.getTime());
			expect(response.body.tournId).toBe(tournId);
		});
		it('returns 400 Bad Request for invalid data', async () => {
			const invalidData = { name: '', start: 'invalid-date', end: 'invalid-date', tournId };
			const res = await request(app)
				.post(`/v1/tab/tourns/${tournId}/timeslots`)
				.set('Authorization', `Bearer ${userkey}`)
				.send(invalidData)
				.expect(400);
			expectProblem(res);
		});
	});
	it('GET /tourns/:tournId/timeslots returns a list of timeslots for the tournament', async () => {
		await factories.timeslot.createTestTimeslot({ tournId });
		const response = await request(app)
			.get(`/v1/tab/tourns/${tournId}/timeslots`)
			.set('Authorization', `Bearer ${userkey}`)
			.expect(200);
		expect(Array.isArray(response.body)).toBe(true);
		response.body.forEach(timeslot => {
			expect(timeslot.tournId).toBe(tournId);
			expect(timeslot).toHaveProperty('id');
			expect(timeslot).toHaveProperty('name');
			expect(timeslot).toHaveProperty('start');
			expect(timeslot).toHaveProperty('end');
		});
	});
	it('PUT /tourns/:tournId/timeslots/:timeslotId updates the timeslot', async () => {
		const timeslotData = factories.timeslot.createTimeslotData({ tournId });
		const { timeslotId } = await factories.timeslot.createTestTimeslot(timeslotData);
		const updatedData = {
			...timeslotData,
			name: 'Updated Timeslot Name',
		};
		const response = await request(app)
			.put(`/v1/tab/tourns/${tournId}/timeslots/${timeslotId}`)
			.set('Authorization', `Bearer ${userkey}`)
			.send(updatedData)
			.expect(200);
		expect(response.body).toBeDefined();
		expect(response.body.name).toBe(updatedData.name);
		expect(new Date(response.body.start).getTime()).toBe(updatedData.start.getTime());
		expect(new Date(response.body.end).getTime()).toBe(updatedData.end.getTime());
	});
});