import crypto from 'crypto';
import config from '../../../../config/config';

const getPersonReputation = {
	GET: async (req, res) => {
		const db = req.db;
		const hash = crypto.createHash('sha256').update(config.CASELIST_KEY).digest('hex');
		if (req.query.caselist_key !== hash) {
			return res.status(401).json({ message: 'Invalid caselist key' });
		}
		const reputation = await db.sequelize.query(`
			SELECT *
			FROM student S
			WHERE S.person = ?
		`, { replacements: [req.query.person_id] });

		return res.status(200).json({ ...reputation[0] });
	},
};

getPersonReputation.GET.apiDoc = {
	summary: 'Load a reputation score for a person ID',
	operationId: 'getPersonReputation',
	parameters: [
		{
			in          : 'query',
			name        : 'person_id',
			description : 'ID of person whose reputation you wish to look up',
			required    : true,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
		{
			in          : 'query',
			name        : 'caselist_key',
			description : 'Key for caselist API access',
			required    : true,
			schema      : {
				type    : 'string',
			},
		},
	],
	responses: {
		200: {
			description: 'Person Reputation',
			content: {
				'*/*': {
					schema: {
						type: 'object',
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['caselist'],
};

export default getPersonReputation;
