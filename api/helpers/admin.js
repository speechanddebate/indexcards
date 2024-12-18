import nodemailer from 'nodemailer';
import { convert } from 'html-to-text';
import config from '../../config/config.js';
import { debugLogger } from './logger.js';

export const adminBlast = async (inputData) => {

	const messageData = { ...inputData };

	const transporter = nodemailer.createTransport({
		host           : config.ADMINMAIL.SERVER || config.MAIL_SERVER || 'localhost',
		port           : config.ADMINMAIL.PORT || config.MAIL_PORT || '25',
		secure         : config.ADMINMAIL.SECURE || false,
		pool           : true,
		maxConnections : config.MAIL_POOL || 64,
		maxMessages    : 100,
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
		messageData.subject = '[TAB] Admin Blast';
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

export default adminBlast;
