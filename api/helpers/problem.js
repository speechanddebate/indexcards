export function sendProblem(req, res, {
	type = 'about:blank',
	title,
	status,
	detail,
	instance = req.originalUrl,
	...extras
}) {
	return res
	.status(status)
	.type('application/problem+json')
	.json({
		type,
		title,
		status,
		detail,
		instance,
		...extras,
	});
}

export function BadRequest(req, res, detail, extras = {}){
	return sendProblem(req, res, {
		title: 'Request Validation Failed',
		status: 400,
		detail,
		...extras,
	});
}
//I hate that the 401 Unauthorized is technically for unauhenticated issues but we live in a society after all
export function Unauthorized(req, res, detail, extras = {}) {
	return sendProblem(req, res, {
		title: 'Invalid or Missing Credentials',
		status: 401,
		detail,
		...extras,
	});
}
export function Forbidden(req, res, detail, extras = {}){
	return sendProblem(req, res, {
		title: 'You Do Not Have Access to This Resource',
		status: 403,
		detail,
		...extras,
	});
}
export function NotFound(req, res, detail, extras = {}){
	return sendProblem(req, res, {
		title: 'The specified resource was not found.',
		status: 404,
		detail,
		...extras,
	});
}
export function UnexpectedError(req, res, detail, extras = {}){
	return sendProblem(req, res, {
		title: 'The Server has encountered an unexpected error.',
		status: 500,
		detail,
		...extras,
	});
}