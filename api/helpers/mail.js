import nodemailer from 'nodemailer';
import { convert } from 'html-to-text';
import config from '../../config/config.js';
import { debugLogger } from './logger.js';

export const emailBlast = async (inputData) => {

	const messageData = { ...inputData };
	let transporter = {};

	if (messageData.share) {

		transporter = nodemailer.createTransport({
			host           : config.SHARE_SMTP_HOST,
			port           : 25,
			secure         : false, // Still allows STARTTLS
			pool           : true,
			maxConnections : 30,
			tls            : {
				secure             : false,
				ignoreTLS          : true,
				rejectUnauthorized : false,
			},
			auth: {
				user: config.SHARE_SMTP_USER,
				pass: config.SHARE_SMTP_PASS,
			},
		});

	} else {
		transporter = nodemailer.createTransport({
			host   : config.MAIL_SERVER,
			port   : config.MAIL_PORT,
			secure : false,
			pool   : true,
		});
	}

	if (!messageData.text && !messageData.html) {
		return { error: true, count: 0, message: 'No message body; not sending' };
	}

	if (messageData.html && !messageData.text) {
		messageData.text = convert(messageData.html);
	}

	if (!messageData.email && !messageData.emails) {
		return { error: true, count: 0, message: 'No desination addresses provided, not sent' };
	}

	// Only send BCC emails so folks do not reply all or see student contact
	// etc. And then add the sender as the To as well so it will not deliver.

	messageData.bcc = Array.from(new Set(messageData.email));
	messageData.to = messageData.to || config.MAIL_FROM;
	messageData.from = messageData.from || config.MAIL_FROM;
	messageData.subject = messageData.subject || 'Message from Tab';

	if (messageData.text) {
		if (messageData.append) {
			messageData.text += `\n\n${convert(messageData.append)}\n`;
		}
		messageData.text += '\n----------------------------\n';
		messageData.text += 'You received this email through your account on https://www.tabroom.com\n';
		messageData.text += 'To stop them, login to your Tabroom account, click the Profile icon at top right, and ';
		messageData.text += 'check off "No Emails", then save your profile.\n';
		messageData.text += 'You can also delete your Tabroom account entirely on that profile screen.';
	}

	if (messageData.html) {
		if (messageData.append) {
			messageData.html += `<br /><p>${convert(messageData.append)}</p>`;
		}
		messageData.html += '<p>-----------------------------</p>';
		messageData.html += '<p>You received this email because you registered for an account on ';
		messageData.html += '<a href="https://www.tabroom.com">https://www.tabroom.com</a></p>';
		messageData.html += '<p>To stop them, visit ';
		messageData.html += '<a href="https://www.tabroom.com/user/login/profile.mhtml">Your Profile</a>, ';
		messageData.html += 'check off "No Emails", and save.</p>';
		messageData.html += '<p>You can also delete your Tabroom account entirely on your profile.</p>';
	}

	if (messageData.attachments && messageData.attachments.length > 0) {
		const attachments = [...messageData.attachments];
		messageData.attachments = [];
		attachments.forEach( file => {
			messageData.attachments.push({
				filename : file.filename,
				content  : file.file,
				encoding : 'base64',
			});
		});
	}

	let result = {};

	if (process.env.NODE_ENV === 'production') {
		try {
			result =  await transporter.sendMail(messageData);
		} catch (err) {
			return new Error(`Failed to send mail: ${err.message}`);
		}
	} else {
		debugLogger.info(`Local: email not sending from ${messageData.from} to ${messageData.to} bcc ${messageData.bcc} `);
		debugLogger.info(`Subject ${messageData.subject}`);
		debugLogger.info(`Text ${messageData.text}`);
		debugLogger.info(`HTML ${messageData.html}`);
		debugLogger.info(`From ${messageData.from}`);
		debugLogger.info(`ReplyTo ${messageData.replyTo}`);
	}

	return {
		error   : false,
		count   : messageData.bcc?.length,
		message : `Email sent to ${(messageData.bcc ? messageData.bcc.length : 0)} recipients`,
		result,
	};
};

export const phoneBlast = async () => {
	return false;
};

export const adminBlast = async (inputData) => {

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
		messageData.subject = 'Admin Blast';
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

	let result = {};

	if (messageData.email) {
		messageData.to = messageData.email;
		if (process.env.NODE_ENV === 'production' || config.MAIL_SERVER === 'mail.in.speechanddebate.org') {
			result = await transporter.sendMail(messageData);
		} else {
			debugLogger.info(`Local: Admin email not sending from ${messageData.from} to ${messageData.bcc}`);
			debugLogger.info(`Subject ${messageData.subject}`);
			debugLogger.info(`Text ${messageData.text}`);
			debugLogger.info(`HTML ${messageData.html}`);
			debugLogger.info(`From ${messageData.from}`);
		}
	}

	return {
		error   : false,
		count   : messageData.to?.length,
		to      : messageData.to,
		message : `Administration blast message sent`,
		result,
	};
};

export default emailBlast;
