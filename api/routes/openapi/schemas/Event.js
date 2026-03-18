export const EventInvite ={
	type        : 'object',
	description : 'An event associated with a tournament invite',
	required    : ['id', 'name', 'abbr', 'type', 'categoryid'],
	properties  : {
		id: {
			type : 'integer',
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
			enum: ['debate', 'speech', 'mock_trial', 'congress', 'wsdc', 'wudc', 'attendee', 'academic'],
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
		nsdaCategory: {
			type: 'number',
			default: 0,
		},
		nsdaName: {
			type: 'string',
		},
	},
};