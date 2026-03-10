export const Person = {
	type : 'object',
	description: 'A person (user) in tabroom',
	additionalProperties: false,
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
	},
};

export const ParadigmDetails = {
	type: 'object',
	required: ['id', 'name', 'lastReviewed', 'paradigm', 'record', 'certifications'],
	additionalProperties: false,
	properties: {
		id: { type: 'integer' },
		name: { type: 'string', description: 'Full name' },
		lastReviewed: { type: 'string', format: 'date-time', description: 'Last reviewed timestamp' },
		paradigm: { type: 'string', description: 'Paradigm content' },
		record: {
			type: 'array',
			items: {
				$ref: '#/components/schemas/JudgeRecord',
			},
		},
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
		record: [
			{
				tournName: 'National Speech and Debate Tournament',
				roundDate: '2018-06-19T22:00:00.000Z',
				roundLabel: 'R1',
				eventAbbr: 'PF',
				affTeam: 'Washington PV',
				affLabel: 'Pro',
				negTeam: 'Denver VX',
				negLabel: 'Con',
				vote: 'Con',
				panelVote: 'Con',
				record: '0-1',
			},
		],
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