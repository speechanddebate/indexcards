export const Person = {
	type : 'object',
	description: 'A person (user) in tabroom',
	additionalProperties: false,
	required: ['id', 'email', 'firstName', 'lastName'],
	properties : {
		id: {
			type: 'integer',
			example: 42,
		},
		email: {
			type: 'string',
			format: 'email',
			example: 'johndoe@tabroom.com',
		},
		firstName: {
			type: 'string',
			example: 'John',
		},
		middleName: {
			type: 'string',
			nullable: true,
			example: 'Quincy',
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
	},
};

export const Session = {
	type: 'object',
	description: 'A user session',
	additionalProperties: false,
	properties: {
		id: {
			type: 'integer',
			example: 111111,
		},
		person: {
			type: 'integer',
			example: 42,
		},
		su: {
			type: 'integer',
			nullable: true,
			example: 7,
		},
		Su: {
			nullable: true,
			$ref: '#/components/schemas/Person',
		},
		Person: {
			$ref: '#/components/schemas/Person',
		},
	},
};

export const ParadigmDetails = {
	type: 'object',
	required: ['id', 'name', 'lastReviewed', 'paradigm', 'certifications'],
	additionalProperties: false,
	properties: {
		id: { type: 'integer' },
		name: { type: 'string', description: 'Full name' },
		lastReviewed: { type: 'string', format: 'date-time', description: 'Last reviewed timestamp' },
		paradigm: { type: 'string', description: 'Paradigm content' },
		certifications: {
			type: 'array',
			items: {
				type: 'object',
				required: ['title', 'description'],
				additionalProperties: false,
				properties: {
					title: { type: 'string' },
					description: { type: 'string'},
					updatedAt: { type: 'string', format: 'date-time' },
					badge: {
						type: 'object',
						properties: {
							altText: { type: 'string' },
							link: { type: 'string', format: 'uri' },
							imageUrl: { type: 'string', format: 'uri' },
						},
						additionalProperties: false,
					},
				},
			},
		},
	},
	example: {
		id: 123,
		name: 'Kilgore Trout',
		lastReviewed: '1979-01-01T12:34:56Z',
		paradigm: 'I will vote for anything involving aliens.',
		certifications: [
			{
				title: 'Alien Case Certification',
				description: 'Certified in understanding alien based cases.',
				updatedAt: '2023-12-01T10:00:00Z',
				badge: {
					altText: 'Alien Case Badge',
					link: 'https://example.com/badges/alien-case',
					imageUrl: 'https://example.com/images/alien-case-badge.png',
				},
			},
		],
	},
};