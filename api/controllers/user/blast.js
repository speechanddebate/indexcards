import axios from 'axios';
import notify from '../../helpers/blast.js';
import config from '../../../config/config.js';

export const pushMessage = {

	POST: async (req, res) => {

		const responseJSON = await notify({
			...req.body,
		});

		res.status(200).json(responseJSON);
	},
};

export const getSubscription = {

	GET: async (req, res) => {

		let externalId = req.session.person;

		if (externalId === 1) {
			externalId = 100;
		}

		if (externalId) {

			try {
				const oneSignalSubscription = await axios.get(
					`${config.ONESIGNAL.URL}/users/by/external_id/${externalId}`,
					{
						headers : {
							Authorization  : `Basic ${config.ONESIGNAL.appKey}`,
							'Content-Type' : 'application/json',
							Accept         : 'application/json',
						},
					},
				);

				if (oneSignalSubscription?.data) {
					return res.status(200).json(oneSignalSubscription?.data);
				}

				return res.status(200).json('No such subscription found.  Record from database deleted');

			} catch (err) {

				console.log(`error returned on the axios get`);
				console.log(err);

				return res.status(400).json(err);

			}
		}

		return res.status(401).json('No active user found');
	},

	DELETE: async (req, res) => {

		const subscriptionId = req.params.subscriptionId;

		if (subscriptionId) {
			const deleteReply = await axios.delete(
				`${config.ONESIGNAL.URL}/subscriptions/${subscriptionId}`,
				{
					headers : {
						Authorization  : `Basic ${config.ONESIGNAL.appKey}`,
						'Content-Type' : 'application/json',
						Accept         : 'application/json',
					},
				},
			);

			return res.status(200).json(deleteReply);
		}

		return res.status(401).json('No active subscription found');
	},
};

export default pushMessage;
