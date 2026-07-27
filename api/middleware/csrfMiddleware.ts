import config from '../config.js';
import { Forbidden } from '../helpers/problem.js';
import type { Request, Response, NextFunction } from 'express';

export default async function csrfMiddleware(req: Request, res: Response, next: NextFunction){
	if(req.authType !== 'cookie'){
		return next();
	}
	// Skip safe methods
	if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
		return next();
	}

	// Skip endpoints that don't require CSRF
	if (req.path === '/v1/auth/login') {
		return next();
	}

	//validate csrf
	const origin = req.headers['origin'];
	if(origin && config.csrf.trusted_origins.includes(origin)){
		return next();
	}
	Forbidden(req,res,'request failed Origin validation');
}
