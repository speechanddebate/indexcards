export const Event ={
	type        : 'object',
	description : 'An event',
	required    : ['id', 'name', 'abbr', 'type', 'categoryId', 'tournId'],
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
			enum: ['debate', 'speech', 'mockTrial', 'congress', 'wsdc', 'wudc', 'attendee', 'academic'],
		},
		categoryId: {
			type: 'integer',
		},
		settings  : { type : 'object', additionalProperties: { type: 'string' } } ,
		metadata  : { type : 'object', additionalProperties: { type: 'string' } } ,
		Tourn: {
			$ref: '#/components/schemas/Category',
		},
		Category: {
			$ref: '#/components/schemas/Category',
		},
		Topic: {
			$ref: '#/components/schemas/Topic',
		},
		Entries: {
			type  : 'array',
			items : { $ref:'#/components/schemas/Entry' },
		},
		nsdaCategoryId: {
			type     : 'integer',
			nullable : true,
		},
		NSDACategory: {
			$ref: '#/components/schemas/NSDACategory',
		},
	},
};
