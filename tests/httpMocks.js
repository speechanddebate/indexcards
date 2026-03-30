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
		get: () => {},
		...overrides,
	};
}
export function createRes() {
	const res = {};

	// Allow statusCode to be set like a real Express res
	res.statusCode = 200;
	Object.defineProperty(res, 'statusCode', {
		writable: true,
		enumerable: true,
		configurable: true,
		value: 200,
	});

	// Allow headers to be set and retrieved
	res.headers = {};
	res.setHeader = (key, value) => { res.headers[key.toLowerCase()] = value; };
	res.getHeader = (key) => res.headers[key.toLowerCase()];
	res.removeHeader = (key) => { delete res.headers[key.toLowerCase()]; };

	res.status      = vi.fn(function(code) { res.statusCode = code; return res; });
	res.body = undefined;
	res.json = vi.fn(function(body) { res.body = body; return res; });
	res.send = vi.fn(function(body) { res.body = body; return res; });
	res.end         = vi.fn().mockReturnValue(res);
	res.set         = vi.fn(function(field, value) {
		if (typeof field === 'string') {
			res.setHeader(field, value);
		} else if (typeof field === 'object') {
			for (const k in field) res.setHeader(k, field[k]);
		}
		return res;
	});
	res.type = vi.fn(function(type) {
		res.setHeader('content-type', type);
		return res;
	});
	res.clearCookie = vi.fn().mockReturnValue(res);
	res.cookie      = vi.fn();

	return res;
}
