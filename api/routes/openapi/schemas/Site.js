export const SiteResponse = {
	type: 'object',
	properties: {
		id: { type: 'integer' , readOnly: true },
		name: { type: 'string' },
		online: { type: 'boolean' },
		directions: { type: 'string', nullable: true },
		dropoff: { type: 'string', nullable: true },
		hostId: { type: 'integer', nullable: true },
		circuitId: { type: 'integer', nullable: true },
		createdAt: { type: 'string', format: 'date-time', readOnly: true },
		updatedAt: { type: 'string', format: 'date-time', readOnly: true },
	},
};