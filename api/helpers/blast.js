import axios from 'axios';
import db from './litedb.js';
import emailBlast from './mail.js';
import config from '../../config/config.js';

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
//	}

export const notify = async (inputData) => {

	const pushReply = {
		web   : {},
		email : {},
	};

	if (!inputData.noEmail) {
		pushReply.email = await emailNotify(inputData);
	}

	if (!inputData.noWeb) {
		pushReply.web = await webBlast(inputData);
	}

	let error = false;

	if (pushReply.web?.error || pushReply.email?.error) {
		error = true;
	}

	const reply = {
		error,
		message : `${pushReply.web.message} and ${pushReply.email.message}`,
		email   : pushReply.email,
		web     : pushReply.web,
	};

	return reply;
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
			count   : inputData.ids.length,
		};
	}

	const recipients = await db.sequelize.query(`
		select
			person.id, person.first, person.last, person.no_email,
			push_notify.value
		from person, person_setting push_notify
		where person.id IN (:personIds)
			and person.id = push_notify.person
			and push_notify.tag = 'push_notify'
	`, {
		replacements: { personIds: inputData.ids },
		type: db.sequelize.QueryTypes.SELECT,
	});

	if (recipients.length < 1) {
		return {
			error   : false,
			message : `No recipients found for the push notification`,
			count   : 0,
		};
	}

	const targetPromise = recipients.map( (person) => {
		if (person.id === 1) {
			// it won't let you use 1 or 0 as user IDs which REALLY PISSED
			// PALMER (UID = 1) OFF THAT I HAD TO WRITE A JANKY CODE EXCEPTION
			// JUST FOR MYSELF.
			return '100';
		}
		return `${person.id}`;
	});

	let targetIds = await Promise.all(targetPromise);

	// If you are not running in production either send it only to the UID
	// spec'd in config.js or to Palmer since let's be real that's almost
	// always who this is. If you mess with this code and do NOT set
	// TEST_USERID though, I will look for you. I will find you.  And I
	// will....

	if (process.env.NODE_ENV !== 'production' && config.MAIL_SERVER !== 'mail.in.speechanddebate.org') {
		targetIds = process.env.TEST_USERID || ['100'];
	}

	if (inputData.append) {
		inputData.text += `\n${inputData.append}`;
	}

	if (targetIds && targetIds.length > 0) {

		const notification = {
			app_id          : config.ONE_SIGNAL.app_id,
			name            : inputData.sender || 'Tournament Blast',
			url 		    : inputData.url || 'https://www.tabroom.com/user/home.mhtml',
			contents        : { en: inputData.text },
			headings        : { en: inputData.subject || 'Message from Tab' },
			include_aliases: {
				external_id: targetIds,
			},
			target_channel  : 'push',
		};

		await axios.post(
			'https://onesignal.com/api/v1/notifications',
			notification,
			{
				headers : {
					Authorization  : `Basic ${config.ONE_SIGNAL.appKey}`,
					'Content-Type' : 'application/json',
					Accept         : 'application/json',
				},
			},
		);

		return {
			error   : false,
			message : `Push notification sent to ${targetIds ? targetIds.length : 0} recipients`,
			count   : targetIds.length,
		};
	}

	return {
		error   : false,
		message : `No recipients found for the push notification`,
		count   : 0,
	};
};

export const emailNotify = async (inputData) => {

	if (
		!inputData.ids
		|| inputData.ids.length < 1
		|| (!inputData.text && !inputData.html)
	) {
		return {
			error   : false,
			message : `No receipients or message sent for push noitications`,
			count   : inputData.ids.length,
		};
	}

	const recipients = await db.sequelize.query(`
		select
			person.id, person.first, person.last, person.email
		from person
		where person.id IN (:personIds)
			and person.no_email != 1
	`, {
		replacements: { personIds: inputData.ids },
		type: db.sequelize.QueryTypes.SELECT,
	});

	const emailPromise = recipients.map( async (person) => {
		return person.email;
	});

	inputData.email = await Promise.all(emailPromise);

	if (inputData.email && inputData.email.length > 0) {
		await emailBlast(inputData);
		return {
			error   : false,
			message : `Message emailed to ${inputData.email.length} recipients `,
			count   : inputData.email.length,
		};
	}

	return {
		error   : false,
		message : `No recipients found for the email notification`,
	};
};

export default notify;
