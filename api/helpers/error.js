import { errorLogger } from './logger.js';
import { adminBlast } from './admin.js';
import config from '../../config/config.js';

export const errorHandler = (err, req, res, next) => {

	// Delegate to default express error handler if headers are already sent
	if (res.headersSent) {
		return next(err);
	}

	err.host = config.DOCKERHOST;

	// Validation error object from OpenAPI
	if (err.status || err.errors) {
		if (err.status === 400) {
			return res.status(err.status).json({
				message          : `OpenAPI Validation error : ${err.message}`,
				errors           : err.errors,
				request          : req.originalUrl,
				stack            : err.stack,
				host             : config.DOCKERHOST,
				logCorrelationId : req.uuid,
				env              : process.env,
			});
		}
		if (err.status === 401) {
			return res.status(err.status).json({
				message: err.message,
			});
		}
	}

	// Default to a 500 error and give me a stack trace PLEASE ALWAYS GIVE ME A
	// FRIGGIN STACK TRACE WHY IS THIS NOT THE DEFAULT DEV BEHAVIOR OMFG.
	errorLogger.error(err, err.stack);

	// Production bugs should find their way to Palmer
	if (
		process.env.NODE_ENV === 'production'
		|| req.originalUrl === '/v1/glp/mailtest/error'
	) {

		console.log('Sending mail');

		const messageData = {
			from    : 'error-handler@tabroom.com',
			email   : config.ERROR_DESTINATION,
			subject : `Indexcards Bug Tripped`,
			text    : `
Host
${config.DOCKERHOST}

Request URL
${req?.originalUrl}

Stack
${err.stack}

Login Session
${JSON.stringify(req.session, null, 4)}

Request Parameters
${JSON.stringify(req.params, null, 4)}

Request Body
${JSON.stringify(req.body, null, 4)}

Raw Full Error Object
${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,

		};

		try {
			adminBlast(messageData);
			err.message += ` Also, this stack was emailed to the admins to ${config.ERROR_DESTINATION}`;
		} catch (error) {
			errorLogger.info(error);
			err.message += ` Also, error response on sending email: ${err}`;
		}
	}

	return res.status(500).json({
		message          : err.message || 'Internal server error',
		host             : config.DOCKERHOST,
		logCorrelationId : req.uuid,
		url              : req.originalUrl,
		path             : req.path,
		stack            : err.stack,
		env              : process.env,
	});
};

export const inlineError = (err, location = 'Unknown') => {

	err.host = config.DOCKERHOST;

	// Validation error object from OpenAPI
	if (err.status || err.errors) {
		if (err.status === 400) {
			return {
				message          : `OpenAPI Validation error : ${err.message}`,
				errors           : err.errors,
				stack            : err.stack,
				host             : config.DOCKERHOST,
				env              : process.env,
			};
		}
		if (err.status === 401) {
			return err.message;
		}
	}

	// Default to a 500 error and give me a stack trace PLEASE ALWAYS GIVE ME A
	// FRIGGIN STACK TRACE WHY IS THIS NOT THE DEFAULT DEV BEHAVIOR OMFG.

	errorLogger.error(err, err.stack);

	// Production bugs should find their way to Palmer
	if (process.env.NODE_ENV === 'production') {

		const messageData = {
			from    : 'error-handler@tabroom.com',
			email   : config.ERROR_DESTINATION,
			subject : `Indexcards Bug Tripped`,
			text    : `
Host
${config.DOCKERHOST}

Location
${location}

Stack
${err.stack}

Raw Full Error Object
${JSON.stringify(err, Object.getOwnPropertyNames(err))}`,

		};

		try {
			adminBlast(messageData);
			err.message += ` Also, this stack was emailed to the admins to ${config.ERROR_DESTINATION}`;
		} catch (error) {
			errorLogger.info(error);
			err.message += ` Also, error response on sending email: ${err}`;
		}
	}

	return {
		message          : err.message || 'Internal server error',
		host             : config.DOCKERHOST,
		path             : location,
		stack            : err.stack,
		env              : process.env,
	};
};

export default errorHandler;
