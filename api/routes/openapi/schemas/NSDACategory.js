export const NSDACategory = {
	type: 'object',
	required: ['id', 'name', 'type', 'code'],
	properties: {
		id        : { type : 'integer' } ,
		name      : { type : 'string' }  ,
		type      : { type : 'string' }  ,
		code      : { type : 'integer' } ,
		nationals : { type : 'boolean' } ,
	},
	examples: {
		example1: {
			id   : 202,
			name : 'Extemporaneous',
			type : 's',
			code : 202,
		},
	},
};