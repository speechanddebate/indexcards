import nodemailer from 'nodemailer';
import { convert } from 'html-to-text';
import { debugLogger, errorLogger } from './logger.js';
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
	if (process.env.NODE_ENV === 'production') {

		const messageData = {
			from    : 'error-handler@tabroom.com',
			email   : config.ERROR_DESTINATION,
			subject : `Indexcards Bug Tripped`,
			text    : `
Host
${config.DOCKERHOST}

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
			errorBlast(messageData);
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

			const message = {
				message          : `Inline Mailer error : ${err.message}`,
				errors           : err.errors,
				stack            : err.stack,
				host             : config.DOCKERHOST,
				env              : process.env,
			};

			errorLogger.error(message);
			return message;
		}

		if (err.status === 401) {

			const message = {
				message          : `Inline Mailer error : ${err.message}`,
				host             : config.DOCKERHOST,
				env              : process.env,
				...err,
			};

			errorLogger.error(message);
			return message;
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
			errorBlast(messageData);
			err.message += ` Also, this stack was emailed to the admins to ${config.ERROR_DESTINATION}`;
		} catch (error) {
			errorLogger.info(error);
			err.message += ` Also, error response on sending email: ${err}`;
		}
	}

	const message = {
		message          : err.message || 'Internal server error',
		host             : config.DOCKERHOST,
		path             : location,
		stack            : err.stack,
		env              : process.env,
	};

	errorLogger.error(message);
	return message;
};

export const errorBlast = async (inputData) => {

	const messageData = { ...inputData };

	const transporter = nodemailer.createTransport({
		host   : config.MAIL_SERVER ? config.MAIL_SERVER : config.MAIL_SERVER,
		port   : config.MAIL_PORT ? config.MAIL_PORT : config.MAIL_PORT,
		secure : false,
	});

	if (!messageData.text && !messageData.html) {
		return { error: true, count: 0, message: 'No message body; not sending' };
	}

	if (messageData.html && !messageData.text) {
		messageData.text = convert(messageData.html);
	}

	if (!messageData.email) {
		return { error: true, count: 0, message: 'No desination addresses provided, not sent' };
	}

	if (!messageData.subject) {
		messageData.subject = '[TAB] Error stacktrace from Indexcards';
	}

	if (messageData.text) {
		if (messageData.append) {
			messageData.text += `\n\n${convert(messageData.append)}\n`;
		}
		messageData.text += '\n----------------------------\n';
		messageData.text += 'Admin blast from https://www.tabroom.com\n';
		messageData.text += 'To stop them, click No Emails from your profile on Tabroom.\n';
	}

	if (messageData.html) {
		if (messageData.append) {
			messageData.html += `<br /><p>${convert(messageData.append)}</p>`;
		}
		messageData.html += '<p>-----------------------------</p>';
		messageData.html += '<p>Admin blast from Tabroom.  To stop them, visit ';
		messageData.html += '<a href="https://www.tabroom.com/user/login/profile.mhtml">Your Profile</a>, ';
		messageData.html += 'check off "No Emails", and save</p>';
	}

	messageData.from = messageData.from ? messageData.from : config.MAIL_FROM;

	const promises = [];

	if (messageData.email) {
		messageData.to = messageData.email;
		if (
			process.env.NODE_ENV === 'production'
			|| config.MAIL_SERVER === 'mail.in.speechanddebate.org'
			|| config.MAIL_TEST
		) {
			const result = transporter.sendMail(messageData);
			promises.push(result);
		} else {
			debugLogger.info(`Local: Admin email not sending from ${messageData.from} to ${messageData.bcc}`);
			debugLogger.info(`Subject ${messageData.subject}`);
			debugLogger.info(`Text ${messageData.text}`);
			debugLogger.info(`HTML ${messageData.html}`);
			debugLogger.info(`From ${messageData.from}`);
		}
	}

	const promise = new Promise( (resolve) => {
		Promise.all(promises).then( () => {
			resolve({
				error   : false,
				count   : messageData.to?.length,
				to      : messageData.to,
				message : `Administration blast message sent`,
			});
		});
	});

	return promise;
};

export default errorHandler;
