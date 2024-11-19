import os from 'os';
import config from '../../../config/config.js';

export const systemStatus = {
	GET: async (req, res) => {
		return res.status(200).json({
			message  : 'OK',
			webhost  : config.DOCKERHOST || config.HOST || 'undefined',
			server   : os.hostname(),
			load     : os.loadavg(),
			uptime   : os.uptime(),
			freemem  : os.freemem(),
			totalmem : os.totalmem(),
			node     : process.version,
			runtime  : process.env?.NODE_ENV,
			database : config.DB_DATABASE,
		});
	},
	POST: async (req, res) => {
		return res.status(200).json({
			message  : 'OK',
			webhost  : config.DOCKERHOST || config.HOST || 'undefined',
			server   : os.hostname(),
			load     : os.loadavg(),
			uptime   : os.uptime(),
			freemem  : os.freemem(),
			totalmem : os.totalmem(),
			node     : process.version,
			runtime  : process.env?.NODE_ENV,
			database : config.DB_DATABASE,
		});
	},
};

export const barfPlease = {
	GET: async (req, res) => {
		throw new Error('OMG, we are not happy, because an error has happened!');
	},
};

systemStatus.GET.apiDoc = {
	summary     : 'Responds with a 200 if up, with some system data',
	operationId : 'getStatus',
	responses   : {
		200: {
			description: 'Server is up',
			content: { '*/*': { schema: { type: 'string' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['systemStatus'],
};

systemStatus.POST.apiDoc = {
	summary     : 'Responds with a 200 if up, with some system data',
	operationId : 'postStatus',
	responses: {
		200: {
			description: 'Server is up',
			content: { '*/*': { schema: { type: 'string' } } },
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['systemStatus'],
};

export default systemStatus;
