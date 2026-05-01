import { createContext } from '../../../../tests/httpMocks.ts';
import { getSession } from './session.js';

describe('getSession', () => {
	it('should return session data if session exists', async () => {
		const { req, res } = createContext({ session: { userId: 123, name: 'Test User' } });
		await getSession(req, res);
		expect(res.statusCode).toBe(200);
		expect(res.body).toEqual({ userId: 123, name: 'Test User' });
	});

	it('should return 404 if no session exists', async () => {
		const { req, res } = createContext({ session: null });
		await getSession(req, res);
		expect(res).toBeProblemResponse(404);
	});
});