export const TimeslotResponse = {
	type: 'object',
	properties: {
		id: { type: 'integer' },
		name: { type: 'string' },
		start: { type: 'string', format: 'date-time' },
		end: { type: 'string', format: 'date-time' },
		tournId: { type: 'integer' },
		updatedAt: { type: 'string', format: 'date-time' },
		createdAt: { type: 'string', format: 'date-time' },
	},
};
export const TimeslotRequest = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		start: { type: 'string', format: 'date-time' },
		end: { type: 'string', format: 'date-time' },
		tournId: { type: 'integer' },
	},
	required: ['name', 'start', 'end', 'tournId'],
};