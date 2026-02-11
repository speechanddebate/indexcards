
import csrfMiddleware from './csrfMiddleware.js';
import config from '../../config/config.js';
import { createContext } from '../../tests/httpMocks.js';
import * as problem from '../helpers/problem.js';

describe('csrfMiddleware', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('skips when authType is not cookie', async () => {
		const { req, res, next } = createContext({
			req: { authType: 'bearer' },
		});

		await csrfMiddleware(req, res, next);

		expect(next).toHaveBeenCalledOnce();
	});

	it.each(['GET', 'HEAD', 'OPTIONS'])(
		'skips CSRF check for safe method %s',
		async (method) => {
			const { req, res, next } = createContext({
				req: {
					authType: 'cookie',
					method,
				},
			});

			await csrfMiddleware(req, res, next);

			expect(next).toHaveBeenCalledOnce();
		}
	);

	it('skips CSRF check for /auth/login', async () => {
		const { req, res, next } = createContext({
			req: {
				authType: 'cookie',
				method: 'POST',
				path: '/auth/login',
			},
		});

		await csrfMiddleware(req, res, next);

		expect(next).toHaveBeenCalledOnce();
	});

	it('allows request when CSRF token matches', async () => {
		const token = 'csrf123';

		const { req, res, next } = createContext({
			req: {
				authType: 'cookie',
				method: 'POST',
				path: '/rest/anything',
				session: {
					csrfToken: token,
				},
				get: (name) =>
          name === config.CSRF.HEADER_NAME ? token : undefined,
			},
		});

		await csrfMiddleware(req, res, next);

		expect(next).toHaveBeenCalledOnce();
	});

	it('rejects when CSRF token is missing', async () => {
		const spy = vi.spyOn(problem, 'Unauthorized');

		const { req, res, next } = createContext({
			req: {
				authType: 'cookie',
				method: 'POST',
				path: '/rest/anything',
				session: {
					csrfToken: 'abc',
				},
				get: () => undefined,
			},
		});

		await csrfMiddleware(req, res, next);

		expect(spy).toHaveBeenCalledOnce();
		expect(next).not.toHaveBeenCalled();
	});

	it('rejects when CSRF token does not match', async () => {
		const spy = vi.spyOn(problem, 'Unauthorized');

		const { req, res, next } = createContext({
			req: {
				authType: 'cookie',
				method: 'POST',
				path: '/rest/anything',
				session: {
					csrfToken: 'expected',
				},
				get: () => 'wrong',
			},
		});

		await csrfMiddleware(req, res, next);

		expect(spy).toHaveBeenCalledOnce();
		expect(next).not.toHaveBeenCalled();
	});
});
