export const TournInvite = {
	allOf: [
		{ $ref: '#/components/schemas/Tourn' },
		{
			type: 'object',
			properties: {
				pages: {
					type: 'array',
					items: { $ref: '#/components/schemas/WebPage' },
				},
				files: {
					type: 'array',
					items: { $ref: '#/components/schemas/File' },
				},
				events: {
					type: 'array',
					items: { $ref: '#/components/schemas/EventInvite' },
				},
				contacts: {
					type: 'array',
					items: { $ref: '#/components/schemas/TournContact' },
				},
			},
		},
	],
};
