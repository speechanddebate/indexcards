import notify from '../../helpers/blast.js';
import config from '../../../config/config.js';

// This route will throw a dummy error to test whether the error reporting is
// working which is apparently pretty goddamned rare.

export const throwTestError = {
	GET: async (req, res) => {
		throw new Error(`I have been called to create an error and i have!`);
	},
};

// This route tests the Tabroom integration to the slack channel.

export const testSlackNotification = {

	GET: async (req, res) => {
		const message = {
			ids     : [1],
			text    : `This message should go to the slack channel and to Palmer`,
			from    : `Tabroom Testing <errors@tabroom.com>`,
			subject : `Slack Channel Message Test`,
		};

		if (config.LINODE.NOTIFY_SLACK) {
			message.emailInclude = [config.LINODE.NOTIFY_SLACK];
		}

		const emailResponse = await notify(message);
		return res.status(200).json(emailResponse);
	},
};

export default throwTestError;
