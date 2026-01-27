export const Category = {
	type: 'object',
	properties: {
		id: { type: 'integer' },
		name: { type: 'string' },
		abbr: { type: 'string' },
		tournId: { type: 'integer' },
		patternId: { type: 'integer', nullable: true },
		settings: { type: 'array', items: { type: 'object' } },
		createdAt: { type: 'string', format: 'date-time' },
		lastModified: { type: 'string', format: 'date-time' },
	},
	examples: [
		{
			id: 1,
			name: 'Lincoln-Douglas',
			abbr: 'LD',
			tournId: 42,
			patternId: 7,
			settings: [],
			createdAt: '2023-01-01T00:00:00Z',
			lastModified: '2023-01-02T00:00:00Z',
		},
	],
};