import { vi } from 'vitest';
//Mocks for unit testing middleware
export function createContext({ req: reqOverrides } = {}) {
	const req = createReq(reqOverrides);
	const res = createRes();

	return {
		req,
		res,
		next: vi.fn(),
	};
}
export function createReq(overrides = {}) {
	return {
		method: 'GET',
		headers: {},
		body: {},
		cookies: {},
		person: undefined,
		session: undefined,
		params: {},
		query: {},
		...overrides,
	};
}
export function createRes() {
	const res = {};

	res.status      = vi.fn().mockReturnValue(res);
	res.json        = vi.fn().mockReturnValue(res);
	res.send        = vi.fn().mockReturnValue(res);
	res.end         = vi.fn().mockReturnValue(res);
	res.set         = vi.fn().mockReturnValue(res);
	res.type        = vi.fn().mockReturnValue(res);
	res.clearCookie = vi.fn().mockReturnValue(res);
	res.cookie      = vi.fn();

	return res;
}
