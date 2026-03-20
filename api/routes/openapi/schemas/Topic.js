export const Topic = {
	type: 'object',
	required: ['id', 'tag', 'source', 'schoolYear', 'topicText'],
	properties: {
		id  : { type : 'integer' } ,
		tag : { type : 'string' }  ,
		source   : {
			type : 'string',
			enum : ['NSDA', 'NCFL', 'CEDA', 'NFHS', 'CPFL', 'NFA', 'AFA'],
		},
		schoolYear : { type : 'integer' } ,
		eventType  : { type : 'string' }  ,
		pattern    : { type : 'string' }  ,
		topicText  : { type : 'string' }  ,

		createdAt : { type : 'string'    , format : 'date-time' }        ,
		createdBy : { $ref: '#/components/schemas/Person' },
		Events: {
			type: 'array',
			items: { $ref: '#/components/schemas/Event' },
		},
	},
};
