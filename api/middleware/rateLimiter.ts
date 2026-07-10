import rateLimiter from 'express-rate-limit';
import { RateLimitExceeded } from '../helpers/problem.js';
import config from '../../config/config.js';
import type { Request, Response, NextFunction } from 'express';
// Helper for RFC 7807 problem details
function rateLimitResponse(req: Request, res: Response, detail: string) {
	return RateLimitExceeded(req, res, detail, { validate: { trustProxy: false } });
}

const rateConfig = config.ratelimit;

const globalLimiter = rateLimiter({
	windowMs: rateConfig.window,
	max: rateConfig.max,
	handler: (req: Request, res: Response) => {
		return rateLimitResponse(req, res, `You have reached your rate limit which is ${rateConfig.max}.`);
	},
});

const messageLimiter = rateLimiter({
	windowMs: rateConfig.message.window,
	max: rateConfig.message.max,
	handler: (req: Request, res: Response) => {
		return rateLimitResponse(req, res, `You have reached your rate limit on messages which is ${config.ratelimit.message.max}.
			Please do not blast people that persistently.`);
	},
});
const searchLimiter = rateLimiter({
	windowMs: rateConfig.search.window,
	max: rateConfig.search.max,
	handler: (req: Request, res: Response) => {
		return rateLimitResponse(req, res, `You have reached your rate limit on searches which is ${config.ratelimit.search.max}.`);
	},
});

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
export function rateLimiterMiddleware(req: Request, res: Response, next: NextFunction) {
	globalLimiter(req, res, () => {
		if (req.path === '/v1/public/search') {
			return searchLimiter(req, res, next);
		}
		if (matchesMessageLimiterPath(req.path)) {
			return messageLimiter(req, res, next);
		}
		return next();
	});
}
