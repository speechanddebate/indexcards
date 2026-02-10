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

export async function getSubscribe(req, res) {
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
		return res.status(201).json({
			title  : 'Subscription view request failed; this user device is not subscribed',
			detail : JSON.stringify(err),
		});
	}

};
export async function pushSubscribe(req,res) {

	if (!req.params.subscriptionId) {
		errorLogger.error(`No subscriptionID sent to the updater`);
		return res.status(200).json('Session subscription disabled');
	}

	const subscription = {
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

		return res.status(201).json({
			title  : 'No such subscription was found',
			detail : JSON.stringify(err),
		});
	}

	if (req.params.subStatus === 'true') {
		return res.status(200).json('Session subscription enabled');
	}

	await req.db.session.update(
		{
			push_notify: null,
			last_access: new Date(),
		},
		{ where: { push_notify : req.params.subscriptionId } },
	);

	return res.status(200).json('Session subscription disabled');
}
export async function pushSync(req, res) {
	const sessionId = req.body.sessionid || req.session.id;
	const push_notify = req.body.subscriptionId || null;
	const promises = [];

	if (push_notify != null) {
		const erasePromise = req.db.session.update(
			{
				push_notify: null,
			},
			{ where: {
				id         : { [Op.ne]: sessionId },
				push_notify,
			},
			},
		);
		promises.push(erasePromise);
	}

	const updateSession = req.db.session.update(
		{
			push_notify,
			last_access: new Date(),
		},
		{ where: { id : sessionId } },
	);

	promises.push(updateSession);
	await Promise.all(promises);
	return res.status(200).json(`Push status saved and synced to session`);
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
