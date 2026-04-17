import rateLimiter from 'express-rate-limit';
import { sendProblem } from '../helpers/problem.js';
import config from '../../config/config.js';
import { Request, Response, NextFunction } from 'express';
// Helper for RFC 7807 problem details
function rateLimitResponse(req: Request, res: Response, detail: string) {
	return sendProblem(req,res, {
		title    : 'Rate limit exceeded',
		status   : 429,
		detail   : detail,
		validate : {trustProxy: false},
	});
}

const globalLimiter = rateLimiter({
	windowMs: config.RATE_WINDOW || 15 * 60 * 1000,
	max: config.RATE_MAX || 10000,
	handler: (req: Request, res: Response) => {
		return rateLimitResponse(req, res, `You have reached your rate limit which is ${config.RATE_MAX}.`);
	},
});

const messageLimiter = rateLimiter({
	windowMs: config.MESSAGE_RATE_WINDOW || 15 * 1000,
	max: config.MESSAGE_RATE_MAX || 1,
	handler: (req: Request, res: Response) => {
		return rateLimitResponse(req, res, `You have reached your rate limit on messages which is ${config.MESSAGE_RATE_MAX}.
            Please do not blast people that persistently.`);
	},
});

const searchLimiter = rateLimiter({
	windowMs: config.SEARCH_RATE_WINDOW || 30 * 1000,
	max: config.SEARCH_RATE_MAX || 5,
	handler: (req: Request, res: Response) => {
		return rateLimitResponse(req, res, `You have reached your rate limit on searches which is ${config.SEARCH_RATE_MAX}.`);
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