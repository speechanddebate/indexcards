export const Student = {
	type: 'object',
	required: ['id', 'firstName', 'lastName', 'chapterId'],
	properties: {
		id: {
			type: 'integer',
			readOnly: true,
			description: 'Unique identifier for the student',
		},
		firstName: {
			type: 'string',
			description: 'First name of the student',
		},
		middleName: {
			type: 'string',
			description: 'Middle name of the student',
		},
		lastName: {
			type: 'string',
			description: 'Last name of the student',
		},
		phonetic: {
			type: 'string',
			description: 'Pronunciation guide',
		},
		gradYear: {
			type: 'integer',
			description: 'Full Year of student graduation',
		},
		novice: { type: 'boolean' },
		retired: { type: 'boolean' },
		gender: {
			type: 'string',
		},
		nsda : {
			type        : 'integer',
			description : 'NSDA Member ID Number',
		},

		chapterId: {
			type        : 'integer',
			description : 'Chapter School that the student belongs to',
		},
		personId: {
			type        : 'integer',
			description : 'Tabroom Person the student is linked to',
		},
		Chapter: {
			$ref: '#/components/schemas/Chapter',
		},
		Person: {
			$ref: '#/components/schemas/Person',
		},
		createdAt: {
			type        : 'string',
			readOnly    : true,
			format      : 'date-time',
			description : 'Creation timestamp',
		},
		settings  : { type : 'object', additionalProperties: { type: ['string', 'integer', 'boolean'] } } ,
		metadata  : { type : 'object', additionalProperties: { type: ['string', 'integer', 'boolean'] } } ,
	},
};