export async function login(req, res) {
	//TODO: take a username and hashed password, validate against the database,
	//and return a session token, creating a session if none exists.
	return res.status(501);
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
export async function logout(req, res) {
	//TODO : invalidate the current session token
	return res.status(501);
};
logout.openapi = {
	summary: 'Logout',
	description: 'Logs out the current user and invalidates the session.',
	tags: ['Auth'],
};