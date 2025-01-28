import axios from 'axios';
import db from './db.js';
import emailBlast from './mail.js';
import config from '../../config/config.js';
import { errorLogger } from './logger.js';

//*
//	Notification data structure for inputData wants to be.  I'll stick this in
//	apiDoc someday.
//
//	inputData = {
//		ids     : [] // Array of recipient ID accounts.
//		text    : string // Test of the message to send
//		subject : string // Subject line of the emails/blasts.  Optional.
//		url     : string // URL appended to the email or where the click-through of
//				  notification lands.  Optional.
//		append  : string // Text appended to the message as a footer. Optional.
//		noWeb   : boolean  // Optional.  If true , no web pushes sent , only email
//		noEmail : boolean  // Optional.  If true , no email sent, only web pushes
//		noInbox : boolean  // Optional.  If true , no message created in Tabroom inbox
//	}

function onlyUnique(value, index, array) {
	return array.indexOf(value) === index;
}

export const notify = async (inputData) => {

	const pushReply = {
		web   : {},
		email : {},
		inbox : {},
	};

	inputData.ids = inputData.ids.filter(onlyUnique);

	const promises = [];

	if (!inputData.noEmail) {
		pushReply.email = emailNotify(inputData);
		promises.push(pushReply.email);
	}

	if (!inputData.noWeb) {
		pushReply.web = webBlast(inputData);
		promises.push(pushReply.web);
	}

	if (!inputData.noInbox) {
		pushReply.inbox = inboxMessage(inputData);
		promises.push(pushReply.inbox);
	}

	let error = false;

	if (pushReply.web?.error || pushReply.email?.error) {
		error = true;
	}

	const returnPromise = new Promise( (resolve) => {

		Promise.all(promises).then( (values) => {

			const reply = {
				error,
				message : 'Notifications sent',
				email   : 0,
				inbox   : 0,
				web     : 0,
			};

			for (const log of values) {
				if (log.email > 0) {
					reply.email += parseInt(log.email);
				}

				if (log.inbox > 0) {
					reply.inbox += parseInt(log.inbox);
				}

				if (log.web > 0) {
					reply.web += parseInt(log.web);
				}
			}
			resolve(reply);
		});
	});

	return returnPromise;
};

export const webBlast = async (inputData) => {

	if (
		!inputData.ids
		|| inputData.ids.length < 1
		|| !inputData.text
	) {
		return {
			error   : false,
			message : `No recipients or message sent for push notifications`,
			web     : inputData.ids.length,
		};
	}

	const recipients = await db.sequelize.query(`
		select
			person.id, person.first, person.last, person.no_email,
			session.push_notify
		from person, session
		where person.id IN (:personIds)
			and person.id = session.person
			and session.push_notify is NOT NULL
			and session.last_access > DATE_SUB(NOW(), INTERVAL 60 DAY)
	`, {
		replacements: { personIds: inputData.ids },
		type: db.sequelize.QueryTypes.SELECT,
	});

	if (recipients.length < 1) {
		return {
			error   : false,
			message : `No web pushes active.`,
			web     : 0,
		};
	}

	let targetIds = recipients.map( (person) => {
		if (person.id === 1) {
			return '100';
		}
		return `${person.id}`;
	});

	// If you are not running in production either send it only to the UID
	// spec'd in config.js or to Palmer since let's be real that's almost
	// always who this is. If you mess with this code and do NOT set
	// TEST_USERID though, I will look for you. I will find you.  And I
	// will....

	if (process.env.NODE_ENV !== 'production'
		&& config.MAIL_SERVER !== 'mail.in.speechanddebate.org'
	) {
		targetIds = process.env.TEST_USERID || ['100'];
	}

	if (inputData.append) {
		inputData.text += `\n${inputData.append}`;
	}

	const promises = [];

	if (targetIds && targetIds.length > 0) {

		const notification = {
			app_id          : config.ONESIGNAL.appId,
			name            : inputData.sender || 'Tournament Blast',
			url 		    : inputData.url || 'https://www.tabroom.com/user/home.mhtml',
			contents        : { en: inputData.text },
			headings        : { en: inputData.subject || 'Message from Tab' },
			include_aliases: {
				external_id: targetIds,
			},
			target_channel  : 'push',
		};

		try {

			const webPromise = axios.post(
				`https://api.onesignal.com/notifications?c=push`,
				notification,
				{
					headers : {
						Authorization  : `Basic ${config.ONESIGNAL.appKey}`,
						'Content-Type' : 'application/json',
						Accept         : 'application/json',
					},
				},
			);

			promises.push(webPromise);

		} catch (err) {
			errorLogger.info(`OneSignal once again produced a mysterious error message: ${JSON.stringify(err)}`);
		}
	}

	const returnPromise = new Promise( (resolve) => {
		Promise.all(promises).then( () => {
			resolve({
				error   : false,
				message : `${targetIds ? targetIds.length : 0} web pushes sent.`,
				web   : targetIds.length,
			});
		});
	});

	return returnPromise;
};

export const emailNotify = async (inputData) => {

	if (
		!inputData.ids
		|| inputData.ids.length < 1
		|| (!inputData.text && !inputData.html)
	) {
		return {
			error   : false,
			message : `No web pushes active.`,
			email   : inputData.ids.length,
		};
	}

	const recipients = await db.sequelize.query(`
		select
			person.id, person.first, person.last, person.email
		from person
		where person.id IN (:personIds)
	`, {
		replacements: { personIds: inputData.ids },
		type: db.sequelize.QueryTypes.SELECT,
	});

	inputData.email = recipients.filter( (person) => {
		if (inputData.ignoreNoEmail || (!person.no_email)) {
			return person;
		}

		return null;

	}).map( (person) => {
		return person.email;
	});

	const promises = [];

	if (inputData.email && inputData.email.length > 0) {
		const promise = emailBlast(inputData);
		promises.push(promise);
	}

	const returnPromise = new Promise( resolve => {
		Promise.all(promises).then( () => {
			resolve({
				error   : false,
				message : `${inputData.email.length} emails sent.`,
				email   : inputData.email.length,
			});
		});
	});

	return returnPromise;

};

export const inboxMessage = async (inputData) => {

	if (
		!inputData.ids
		|| inputData.ids.length < 1
		|| (!inputData.text && !inputData.html)
	) {
		return {
			error   : false,
			message : `No receipients sent.`,
			inbox   : inputData.ids.length,
		};
	}

	const message = {
		body          : inputData.html || inputData.text,
		subject       : inputData.subject,
		sender        : inputData.sender,
		sender_string : inputData.replyTo || inputData.from,
		url           : inputData.url,
		email         : inputData.emailId,
		created_at    : new Date(),
	};

	// Tourn must exist, or otherwise be null
	if (inputData.tourn) {
		message.tourn = inputData.tourn;
	}

	if (message.email) {
		delete message.body;
	}

	const responses = [];
	const errors = [];

	inputData.ids.forEach( async (id) => {
		try {
			const response = await db.message.create({
				person: id,
				...message,
			});
			responses.push(response);
		} catch (err) {
			errors.push(err);
		}
	});

	await Promise.all(responses);

	if (errors.length > 1) {

		errorLogger.error(errors);

		return {
			error   : true,
			message : `${errors.length} Errors saving messages to Tabroom inboxes`,
			errors,
		};
	}

	return {
		error   : false,
		inbox   : inputData.ids.length,
		message : `${inputData.ids.length} Tabroom inbox messages delivered.`,
	};
};

export default notify;
