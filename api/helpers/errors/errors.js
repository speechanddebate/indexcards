export class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
	}
}

export class ValidationError extends AppError {
	constructor(message, errors = []) {
		super(message, 400);
		this.errors = errors;
	}
}