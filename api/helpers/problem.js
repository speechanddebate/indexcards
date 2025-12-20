export function sendProblem(res, {
	type = 'about:blank',
	title,
	status,
	detail,
	instance,
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

export function BadRequest(res, detail, extras = {}){
	return sendProblem(res, {
		title: 'Request Validation Failed',
		status: 400,
		detail,
		...extras,
	});
}
//I hate that the 401 Unauthorized is technically for unauhenticated issues but we live in a society after all
export function Unauthorized(res, detail, extras = {}) {
	return sendProblem(res, {
		title: 'Invalid or Missing Credentials',
		status: 401,
		detail,
		...extras,
	});
}
export function Forbidden(res, detail, extras = {}){
	return sendProblem(res, {
		title: 'You Do Not Have Access to This Resource',
		status: 403,
		detail,
		...extras,
	});
}
export function NotFound(res, detail, extras = {}){
	return sendProblem(res, {
		title: 'The specified resource was not found.',
		status: 404,
		detail,
		...extras,
	});
}
export function UnexpectedError(res, detail, extras = {}){
	return sendProblem(res, {
		title: 'The Server has encountered an unexpected error.',
		status: 500,
		detail,
		...extras,
	});
}