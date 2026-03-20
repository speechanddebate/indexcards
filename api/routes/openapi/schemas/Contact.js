export const Contact = {
	type : 'object',
	description: 'A tournament contact for a school',
	required: ['id', 'schoolId', 'personId'],
	properties : {
		id: {
			type: 'integer',
			example: 42,
		},
		schoolId: {
			type : 'integer',
		},
		personId: {
			type : 'integer',
		},
		official : {
			type        : 'boolean',
			description : 'True if the contact is a designated official contact for the school',
		},
		onsite : {
			type        : 'boolean',
			description : 'True if the contact will be physically present at the tournament',
		},
		email : {
			type        : 'boolean',
			description : 'True if the contact should get mass emails for the school',
		},
		book : {
			type        : 'boolean',
			description : 'True if the contact should appear in the Nationals TBook',
		},
		nsda: {
			type        : 'integer',
			description : 'NSDA ID number of the contact if they are a coach',
		},
		firstName: {
			type    : 'string',
			example : 'John',
		},
		middleName: {
			type     : 'string',
			nullable : true,
			example  : 'Quincy',
		},
		lastName: {
			type: 'string',
			example: 'Doe',
		},
		state: {
			type: 'string',
			example: 'CA',
		},
		country: {
			type: 'string',
			example: 'USA',
		},
		tz: {
			type: 'string',
			example: 'America/Los_Angeles',
		},
		createdAt: {
			type        : 'string',
			readOnly    : true,
			format      : 'date-time',
			description : 'Creation timestamp',
		},
		settings  : { type : 'object', additionalProperties: { type: 'string' } } ,
		metadata  : { type : 'object', additionalProperties: { type: 'string' } } ,
		Person: {
			$ref: '#/components/schemas/Person',
		},
		School: {
			$ref: '#/components/schemas/School',
		},
	},
};
