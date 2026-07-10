import nodemailer from 'nodemailer';
import { convert } from 'html-to-text';
import config from '../config.js';
import logger from './logger.js';

export const adminBlast = async (inputData) => {

	const messageData = { ...inputData };

	const transporter = nodemailer.createTransport({
		host           : config.mail.admin?.server || config.mail.server,
		port           : config.mail.admin?.port || config.mail.port,
		secure         : config.mail.admin?.secure || false,
		pool           : true,
		maxConnections : config.mail.pool,
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

	messageData.from = messageData.from ? messageData.from : config.mail.from;

	const promises = [];

	if (messageData.email) {
		messageData.to = messageData.email;
		if (
			process.env.NODE_ENV === 'production'
			|| config.mail.server === 'mail.in.speechanddebate.org'
			|| config.mail.test
		) {
			const result = transporter.sendMail(messageData);
			promises.push(result);
		} else {
			logger.warn('Local: Admin email not sent', {
				action: 'admin_blast_local',
				from: messageData.from,
				to: messageData.email,
				subject: messageData.subject,
				text: messageData.text,
				html: messageData.html,
			});
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
