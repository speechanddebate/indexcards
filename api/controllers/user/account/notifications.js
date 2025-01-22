/* eslint-disable camelcase */
import axios from 'axios';
import { Op } from 'sequelize';
import { errorLogger } from '../../../helpers/logger.js';
import config from '../../../../config/config.js';

const headers = {
	Authorization  : `Basic ${config.ONESIGNAL.appKey}`,
	'Content-Type' : 'application/json',
	Accept         : 'application/json',
};

export const pushSubscribe = {

	GET  : async (req,res) => {

		try {

			const reply = await axios.get(
				`${config.ONESIGNAL.URL}/users/by/external_id/${req.params.tabroomId}`,
				{ headers },
			);

			if (reply.data?.subscriptions) {
				for (const sub of reply.data.subscriptions) {
					if (sub.id === req.params.subscriptionId) {
						return res.status(201).json(sub);
					}
				}
			}

			return res.status(201).json({ message: 'No such subscription found', enabled: false });

		} catch (err) {
			errorLogger.error(`Subscription fetch requested failed with ${err}`);
			return res.status(201).json('Subscription view request failed');
		}

	},

	POST : async (req, res) => {

		if (!req.params.subscriptionId) {
			errorLogger.error(`No subscriptionID sent to the updater`);
			return res.status(200).json('Session subscription disabled');
		}

		const subscription = {
			// eslint-disable-next-line no-unneeded-ternary
			enabled: (req.params.subStatus === 'true' ? true : false),
			notification_types: (req.params.subStatus === true ? 1 : -2),
		};

		try {
			await axios.patch(
				`${config.ONESIGNAL.URL}/subscriptions/${req.params.subscriptionId}`,
				{ subscription } ,
				{ headers },
			);
		} catch (err) {
			errorLogger.error(`Subscription unsubscribe resulted in error ${err}`);
			return res.status(201).json('Subscription change request failed');
		}

		if (req.params.subStatus === 'true') {
			return res.status(200).json('Session subscription enabled');
		}

		await req.db.session.update(
			{
				push_notify: null,
				push_active: null,
				last_access: new Date(),
			},
			{ where: { push_notify : req.params.subscriptionId } },
		);

		return res.status(200).json('Session subscription disabled');
	},
};

export const pushSync = {

	POST : async (req, res) => {

		const sessionId = req.body.sessionid || req.session.id;

		const erasePromise = req.db.session.update(
			{
				push_notify: null,
				push_active: null,
			},
			{ where: {
				id         : { [Op.ne]: sessionId },
				push_notify : req.body.subscriptionId,
			},
			},
		);

		const updateSession = req.db.session.update(
			{
				push_notify: req.body.subscriptionId,
				push_active: new Date(),
				last_access: new Date(),
			},
			{ where: { id : sessionId } },
		);

		await Promise.all([updateSession, erasePromise]);
		return res.status(200).json(`Push status saved and synced to session`);
	},
};

export const enablePushNotifications = {

	POST: async (req, res) => {

		const db = req.db;
		const oneSignalData = req.body;
		let external_id = req.session.person;

		if (external_id === 1) {
			external_id = 100;
		}

		if (req.body.sessionId && req.body.id) {

			const dbpromise =  db.sequelize.query(
				` update session set push_notify = :id where id = :sessionId `,
				{
					type         : db.Sequelize.QueryTypes.UPDATE,
					replacements : req.body,
				}
			);
			const axpromise = axios.patch(
				`${config.ONESIGNAL.URL}/subscriptions/${req.body.id}`,
				{ subscription: { external_id } },
				{ headers },
			);

			await Promise.all([axpromise, dbpromise]);
			return res.status(200).json(`Subscription applied to user ${req.session.person}`);
		}

		if (!oneSignalData.currentSubscription) {
			res.status(200).json({
				error   : true,
				message : 'No current subscription was found or registered',
			});
			return;
		}

		if (!req.session?.id) {
			res.status(200).json({
				error   : true,
				message : 'You are not logged into Tabroom',
			});
			return;
		}

		const currentSubscription = {
			id      : oneSignalData.currentSubscription?.id,
			enabled : oneSignalData.currentSubscription?.optIn,
		};

		if (!req.session?.push_notify
			|| req.session?.push_notify !== currentSubscription.id
		) {
			await db.session.update(
				{ push_notify : currentSubscription.id },
				{ where: { id : req.session.id } }
			);
		}

		let pushNotify = await db.personSetting.findOne({
			where: {
				person : req.session.person,
				tag    : 'push_notify',
			},
		});

		if (pushNotify) {
			pushNotify = await pushNotify.update({
				value: oneSignalData.identity.onesignal_id,
			});
		} else {

			try {
				pushNotify = await db.personSetting.create({
					person : req.session.person,
					tag    : 'push_notify',
					value  : oneSignalData.identity.onesignal_id,
				});
			} catch (err) {
				errorLogger.info(`Push notify person setting was not created`);
				errorLogger.info(err);
			}
		}

		res.status(200).json({
			error   : false,
			message : 'You are subscribed to push notifications.  SMS texting is disabled',
		});
	},
};

export const disablePushNotifications = {

	GET: async (req, res) => {
		const db = req.db;

		if (!req.session || !req.session?.person) {
			res.status(200).json({
				error   : true,
				message : 'You are not currently logged into Tabroom',
			});
		}

		await db.personSetting.destroy({
			where: {
				person : req.session.person,
				tag    : 'push_notify',
			},
		});

		res.status(200).json({
			error   : false,
			message : 'You are unsubscribed to push notifications.  SMS texting is re-enabled if you had it set up before',
		});
	},

	POST: async (req, res) => {

		const db = req.db;

		if (req.session?.id) {

			const pushNotify = req.params.subscriptionId || req.session.push_notify;

			await axios.delete(
				`${config.ONESIGNAL.URL}/subscriptions/${pushNotify}`,
				{ headers },
			);

			await db.session.update({ push_notify: null }, {
				where: {
					id: req.session.id,
				},
			});

			res.status(200).json({
				error   : false,
				message : `Invalid subscription ${pushNotify} removed from session ${req.session.id}`,
			});

		} else {

			res.status(200).json({
				error   : true,
				message : `No current session found`,
			});
		}
	},
};

export default pushSubscribe;

/* Documentation Examples

	CREATE A USER

	const url = 'https://api.onesignal.com/apps/{app_id}/users';
	method: 'POST';
	body: JSON.stringify({
		properties: {
			language: 'en',
			timezone_id: 'America\/Los_Angeles',
			lat: 90,
			long: 135,
			country: 'US',
			first_active: 1678215680,
			last_active: 1678215682
		},
		identity: {external_id: 'test_external_id'}
		})
	};

	VIEW A USER

	const url = 'https://api.onesignal.com/apps/{app_id}/users/by/{external_id}/alias_id';
	method: 'GET',

	EDIT USER
	const url = 'https://api.onesignal.com/apps/{app_id}/users/by/alias_label/alias_id';
	const options = {
		method: 'PATCH',
		body: JSON.stringify({
		properties: {
			language: 'en',
			timezone_id: 'America\/Los_Angeles',
			lat: 90,
			long: 135,
			country: 'US',
			first_active: 1678215680,
			last_active: 1678215682
		},
		deltas: {	// User properties that change frequently and generally only increment.
			session_count: 2,
		}
		})
	};

	DELETE A USER
	const url = 'https://api.onesignal.com/apps/{app_id}/users/by/alias_label/alias_id';
	method: DELETE;

	GIVEN A SUBSCRIPTION ID, SEE ALL THE USER IDENTITIES:
	const url = 'https://api.onesignal.com/apps/{app_id}/subscriptions/subscription_id/user/identity';
	method: GET

	CREATE AN ALIAS (For instance, add an external ID if you only know the User ID)
	const url = 'https://api.onesignal.com/apps/app_id/users/by/alias_label/alias_id/identity'; <-- the one you know
	method: 'PATCH',
		body: JSON.stringify({identity: {external_id: 'test_external_id'}})	<--- the one you add

	ALIAS IF YOU KNOW A SUBSCRIPTION
	const url = 'https://api.onesignal.com/apps/app_id/subscriptions/subscription_id/user/identity';
	method: 'PATCH',
	body: JSON.stringify({identity: {external_id: 'test_external_id'}})

	DELETE AN ALIAS
	const url = 'https://api.onesignal.com/apps/app_id/users/by/external_id/alias_id/identity/alias_label_to_delete';
	const options = {method: 'DELETE', headers: {accept: 'application/json'}};

	CREATE SUBSCRIPTION
	const url = 'https://api.onesignal.com/apps/app_id/users/by/external_id/alias_id/subscriptions';
	method: 'POST',
	body: JSON.stringify({subscription: {type: 'Email'}})

	UPDATE SUBSCRIPTION
	const url = 'https://api.onesignal.com/apps/app_id/subscriptions/subscription_id';
	method: 'PATCH',
	body: JSON.stringify({subscription: {enabled: true}})

	TRANSFER SUBSCRIPTION TO A DIFFERENT USER
	const url = 'https://api.onesignal.com/apps/app_id/subscriptions/subscription_id/owner';
	method: 'PATCH',
	body: JSON.stringify({identity: {external_id: 'test_external_id'}})

*/
