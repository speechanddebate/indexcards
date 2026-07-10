import rateLimiter from 'express-rate-limit';
import { RateLimitExceeded } from '../helpers/problem.js';
import config from '../config.js';
import type { Request, Response, NextFunction } from 'express';

// Helper for RFC 7807 problem details
function rateLimitResponse(req: Request, res: Response, detail: string) {
	return RateLimitExceeded(req, res, detail, { validate: { trustProxy: false } });
}

const globalLimiter = ((global) =>
	rateLimiter({
		windowMs: global.window,
		max: global.max,
		handler: (req: Request, res: Response) => 
			rateLimitResponse(req, res, `You have reached your rate limit which is ${global.max}.`,
			),
	}))(config.ratelimiter);

const messageLimiter = ((message) =>
	rateLimiter({
		windowMs: message.window,
		max: message.max,
		handler: (req: Request, res: Response) =>
			rateLimitResponse(
				req,
				res,
				`You have reached your rate limit on messages which is ${message.max}. Please do not blast people that persistently.`,
			),
	}))(config.ratelimiter.message);

const searchLimiter = ((search) =>
	rateLimiter({
		windowMs: search.window,
		max: search.max,
		handler: (req: Request, res: Response) =>
			rateLimitResponse(
				req,
				res,
				`You have reached your rate limit which is ${search.max}.`,
			),
	}))(config.ratelimiter.search);

// List of allowed verbs for message limiter
const allowedVerbs = [
	'message', 'blast', 'poke', 'blastMessage', 'blastPairing',
];

function matchesMessageLimiterPath(path: string): boolean {
	if (!path.startsWith('/v1/tab/')) return false;
	const lastSegment = path.split('/').pop();
	if (!lastSegment) return false;
	return allowedVerbs.includes(lastSegment);
}

export function rateLimiterMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	if (!config.ratelimiter.enabled) {
		return next();
	}

	return globalLimiter(req, res, () => {
		if (req.path === '/v1/public/search') {
			return searchLimiter(req, res, next);
		}

		if (matchesMessageLimiterPath(req.path)) {
			return messageLimiter(req, res, next);
		}

		return next();
	});
}
