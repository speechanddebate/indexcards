import { errorLogger } from '../../../helpers/logger.js';

export const enablePushNotifications = {
	POST: async (req, res) => {
		const db = req.db;
		const oneSignalData = req.body;

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

	DELETE: async (req, res) => {

		const db = req.db;

		if (req.session?.id) {

			const pushNotify = req.session.push_notify;

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

export default enablePushNotifications;
