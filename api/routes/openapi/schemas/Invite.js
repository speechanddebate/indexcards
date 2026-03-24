export const TournInvite = {
	allOf: [
		{ $ref: '#/components/schemas/Tourn' },
		{
			type: 'object',
			properties: {
				Webpages: {
					type: 'array',
					items: { $ref: '#/components/schemas/Webpage' },
				},
				Files: {
					type: 'array',
					items: { $ref: '#/components/schemas/File' },
				},
				Events: {
					type: 'array',
					items: { $ref: '#/components/schemas/EventInvite' },
				},
				Contacts: {
					type: 'array',
					items: { $ref: '#/components/schemas/TournContact' },
				},
			},
		},
	],
};
export const EventInvite = {

};
