import { BadRequest, Unauthorized } from '../helpers/problem.js';
import authService, { AUTH_INVALID }  from '../services/AuthService.js';
import config from '../../config/config.js';
import sessionRepo from '../repos/sessionRepo.js';
import { ValidationError } from '../helpers/errors/errors.js';

export async function login(req, res) {
	//validate request, in future should validate against the openapi schema
	const { username, password } = req.body;

	if (!username || !password) {
		return BadRequest(req,res, 'username and password are required');
	}
	let result;
	try {
		result = await authService.login(username,password,{
			ip: req.ip,
			agentData: req.get('User-Agent'),
		});
	}  catch (err) {
		if (err === AUTH_INVALID) return Unauthorized(req,res,'Invalid Credentials');
		throw err;
	}

	const { person, token } = result;

	var response = {
		token: token,
		person: { //should conform to personSchema
			id: person.id,
			email: person.email,
		},
	};
	res.cookie(config.COOKIE_NAME, token, authService.getAuthCookieOptions());
	res.cookie(config.CSRF.COOKIE_NAME, authService.generateCSRFToken(token), authService.getCSRFCookieOptions());
	return res.json(response);
};

export async function logout(req, res){

	if (req.session?.id) {
		await sessionRepo.deleteSession(req.session?.id);
	}

	// Clear cookie if present
	res.clearCookie(config.COOKIE_NAME,authService.getAuthCookieOptions());
	res.clearCookie(config.CSRF.COOKIE_NAME,authService.getCSRFCookieOptions());

	// Always return success
	res.status(204).send();
}

export async function register(req,res){
	let result = null;
	try {
		result = await authService.register(req.body,{
			ip: req.ip,
			agentData: req.get('User-Agent'),
		});
	} catch (err) {
		if (err instanceof ValidationError) return BadRequest(req, res, err.message);
		throw err;
	}
	const { personId, token } = result;

	const response = {
		token: token,
		personId: personId,
	};
	res.cookie(config.COOKIE_NAME, token, authService.getAuthCookieOptions());
	res.cookie(config.CSRF.COOKIE_NAME, authService.generateCSRFToken(token), authService.getCSRFCookieOptions());
	return res.json(response);
}