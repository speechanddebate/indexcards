import { BadRequest, Unauthorized } from '../helpers/problem.js';
import authService, { AUTH_INVALID }  from '../services/AuthService.js';
import config from '../../config/config.js';
import sessionRepo from '../repos/sessionRepo.js';
import { ValidationError } from '../helpers/errors/errors.js';
import { LoginRequest, LoginResponse } from '../routes/openapi/schemas/index.js';

export async function login(req, res) {
	const validation = LoginRequest.safeParse(req.body);
	if (!validation.success) {
		return BadRequest(req, res, 'Invalid request payload');
	}
	const { username, password } = validation.data;
	let result;
	try {
		result = await authService.login(username, password, {
			ip: req.ip,
			agentData: req.get('User-Agent'),
		});
	}  catch (err) {
		if (err === AUTH_INVALID) return Unauthorized(req,res,'Invalid Credentials');
		throw err;
	}

	const { person, token } = result;
	const validationResponse = LoginResponse.safeParse({
		token: token,
		Person: { //should conform to personSchema
			id: person.id,
			email: person.email,
		},
	});
	if (!validationResponse.success) {
		return BadRequest(req, res, 'Invalid response payload');
	}
	res.cookie(config.COOKIE_NAME, token, authService.getAuthCookieOptions());
	res.cookie(config.CSRF.COOKIE_NAME, authService.generateCSRFToken(token), authService.getCSRFCookieOptions());
	return res.json(validationResponse.data);
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