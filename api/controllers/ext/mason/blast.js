/* eslint-disable no-useless-escape */
import { notify } from '../../../helpers/blast.js';
import { errorLogger } from '../../../helpers/logger.js'

export const blastMessage = {

	POST: async (req, res) => {

		if (!req.body.text) {
			return res.status(200).json({ error: true, message: 'No message to blast sent' });
		}

		const notifyResponse = await notify({ ...req.body });

		if (notifyResponse.error) {
			errorLogger.error(notifyResponse.message);
			return res.status(401).json(notifyResponse);
		} else {
			return res.status(200).json({
				error   : false,
				message : notifyResponse.message,
			});
		}
	},
};

export default blastMessage;
