export const EventInvite ={
	type: 'object',
	description: 'An event associated with a tournament invite',
	properties: {
		id: {
			type: 'integer',
		},
		abbr: {
			type: 'string',
		},
		name: {
			type: 'string',
		},
		fee: {
			type: 'number',
		},
		type: {
			type: 'string',
		},
		categoryId: {
			type: 'integer',
		},
		categoryName: {
			type: 'string',
		},
		categoryAbbr: {
			type: 'string',
		},
		judgeFieldReport: {
			type: 'string',
		},
		cap: {
			type: 'integer',
			nullable: true,
		},
		schoolCap: {
			type: 'integer',
			nullable: true,
		},
		topicSource: {
			type: 'string',
			nullable: true,
		},
		topicEventType: {
			type: 'string',
			nullable: true,
		},
		topicTag: {
			type: 'string',
			nullable: true,
		},
		topicText: {
			type: 'string',
			nullable: true,
		},
		fieldReport: {
			type: 'string',
			nullable: true,
		},
		anonymousPublic: {
			type: 'boolean',
			nullable: true,
		},
		liveUpdates: {
			type: 'string',
		},
		description: {
			type: 'string',
			nullable: true,
		},
		currency: {
			type: 'string',
		},
		entryCount: {
			type: 'integer',
		},
		nsdaCode: {
			type: 'string',
		},
		nsdaName: {
			type: 'string',
		},
	},
};