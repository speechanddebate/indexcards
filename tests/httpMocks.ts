import type { NextFunction, Request, Response } from 'express';
import { vi } from 'vitest';

//Mocks for unit testing middleware
export function createContext(reqOverrides: Partial<Request> = {}) {
	const req = createReq(reqOverrides);
	const res = createRes();

	return {
		req,
		res,
		next: vi.fn() as unknown as NextFunction,
	};
}

export function createReq(overrides: Partial<Request> & Record<string, unknown> = {}): Request {
	return {
		method: 'GET',
		headers: {},
		body: {},
		cookies: {},
		person: undefined,
		session: undefined,
		params: {},
		query: {},
		valid: {},
		get: () => {},
		...overrides,
	} as unknown as Request;
}

export function createRes(): Response {
	const headers: Record<string, string> = {};

	const res = {
		statusCode: 200,
		headers,
		body: undefined as unknown,
		setHeader: (key: string, value: string) => { headers[key.toLowerCase()] = value; },
		getHeader: (key: string) => headers[key.toLowerCase()],
		removeHeader: (key: string) => { delete headers[key.toLowerCase()]; },
		status: vi.fn(function(code: number) { res.statusCode = code; return res; }),
		json: vi.fn(function(body: unknown) { res.body = body; return res; }),
		send: vi.fn(function(body: unknown) { res.body = body; return res; }),
		end: vi.fn().mockReturnValue(undefined),
		set: vi.fn(function(field: string | Record<string, string>, value?: string) {
			if (typeof field === 'string') {
				res.setHeader(field, value!);
			} else {
				for (const k in field) res.setHeader(k, field[k]);
			}
			return res;
		}),
		type: vi.fn(function(type: string) {
			res.setHeader('content-type', type);
			return res;
		}),
		clearCookie: vi.fn().mockReturnValue(undefined),
		cookie: vi.fn(),
	};

	return res as unknown as Response;
}
