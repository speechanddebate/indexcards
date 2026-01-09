export const parameters = {
	tournId: {
		name: 'tournId',
		in: 'path',
		description: 'The ID or webname of the tournament to retrieve.',
		required: true,
		schema: {
			type: 'string',
		},
	},
	roundId: {
		name: 'roundId',
		in: 'path',
		description: 'The ID or webname of the round to retrieve.',
		required: true,
		schema: {
			type: 'string',
		},
	},
};