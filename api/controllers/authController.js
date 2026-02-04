import { BadRequest, Unauthorized } from '../helpers/problem.js';
import authService, { AUTH_INVALID }  from '../services/AuthService.js';
import config from '../../config/config.js';
import sessionRepo from '../repos/sessionRepo.js';

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

login.openapi = {
	summary: 'Login',
	description: 'Logs in a user and creates a session.',
	tags: ['Auth', 'Public'],
	security: [],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: {
					$ref: '#/components/schemas/LoginRequest',
				},
			},
		},
	},
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

logout.openapi = {
	summary: 'Logout',
	description: 'Logs out the current user and invalidates the session.',
	tags: ['Auth'],
};