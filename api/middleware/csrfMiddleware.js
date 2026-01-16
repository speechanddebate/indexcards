import config from '../../config/config.js';
import { Unauthorized } from '../helpers/problem.js';

export default async function csrfMiddleware(req,res,next){
	if(req.authType !== 'cookie'){
		return next();
	}
	// Skip safe methods
	if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
		return next();
	}

	// Skip endpoints that don't require CSRF
	if (req.path === '/auth/login') {
		return next();
	}

	//validate csrf
	const csrfToken = req.get(config.CSRF.HEADER_NAME);
	if(csrfToken === req.session.csrfToken){
		return next();
	}
	Unauthorized(req,res,'request failed CSRF validation');
}