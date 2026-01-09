import notify from '../../helpers/blast.js';
import config from '../../../config/config.js';

// This route will throw a dummy error to test whether the error reporting is
// working which is apparently pretty goddamned rare.

export async function throwTestError(req, res) {
	throw new Error(`I have been called to create an error and i have!`);
}
throwTestError.openapi = {
	summary: 'Undocumented Endpoint',
	tags: ['Admin : Mail'],
	security: [{ basic: [] }],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};
// This route tests the Tabroom integration to the slack channel.

export async function testSlackNotification(req, res) {
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
};
testSlackNotification.openapi = {
	summary: 'Undocumented Endpoint',
	tags: ['Admin : Mail'],
	responses: {
		'200': {
			description: 'OK',
		},
		'401' : { $ref: '#/components/responses/Unauthorized' },
	},
};
