export const Entry ={
	type        : 'object',
	description : 'An entry',
	required    : ['id', 'code', 'eventId'],
	properties  : {
		id: {
			type : 'integer',
		},
		code: {
			type: 'string',
		},
		name: {
			type: 'string',
		},
		ada         : { type : 'boolean' },
		active      : { type : 'boolean' },
		dropped     : { type : 'boolean' },
		waitlist    : { type : 'boolean' },
		unconfirmed : { type : 'boolean' },
		eventId: {
			type: 'integer',
		},
		schoolId: {
			type: 'integer',
		},
		registeredById: {
			type: 'integer',
		},
		RegisteredBy: {
			$ref: '#/components/schemas/Person',
		},
		Event: {
			$ref: '#/components/schemas/Event',
		},
		School: {
			$ref: '#/components/schemas/School',
		},
		Students: {
			type: 'array',
			items: { $ref: '#/components/schemas/Student' },
		},
		settings  : { type : 'object', additionalProperties: { type: 'string' } } ,
		metadata  : { type : 'object', additionalProperties: { type: 'string' } } ,
		createdAt: {
			type        : 'string',
			readOnly    : true,
			format      : 'date-time',
			description : 'Creation timestamp',
		},
	},
};