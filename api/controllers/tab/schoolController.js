import { NotFound, NotImplemented } from '../../helpers/problem.js';
import schoolRepo from '../../repos/schoolRepo.js';

export async function getSchool(req, res) {
	const tournId = Number(req.params.tournId);
	const schoolId = Number(req.params.schoolId);

	const school = await schoolRepo.getSchool(schoolId);
	if (!school || school.tournId !== tournId) {
		return NotFound(req, res, `School with id ${schoolId} not found in tournament ${tournId}.`);
	}

	return res.json(school);
}
getSchool.openapi = {
	summary: 'Get School by ID',
	description: 'Retrieves a school by its ID within the specified tournament.',
	tags: ['Schools'],
	responses: {
		200: {
			description: 'School retrieved successfully',
			content: {
				'application/json': {
					schema: { $ref: '#/components/schemas/School' },
				},
			},
		},
		404 : { $ref: '#/components/responses/NotFound' },
	},
};

export async function getSchools(req, res) {
	const tournId = Number(req.params.tournId);

	const schools = await schoolRepo.getSchools({ tournId });
	return res.json(schools);
}
getSchools.openapi = {
	summary: 'Get Schools for Tournament',
	description: 'Retrieves all schools associated with the specified tournament.',
	tags: ['Schools'],
	responses: {
		200: {
			description: 'Schools retrieved successfully',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/School' },
					},
				},
			},
		},
		404 : { $ref: '#/components/responses/NotFound' },
	},
};

export async function createSchool(req, res) {
	return NotImplemented(req, res);
}
createSchool.openapi = {
	summary: 'Create School',
	description: 'Creates a new school within the specified tournament.',
	tags: ['Schools'],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/CreateSchool' },
			},
		},
	},
	responses: {
		201: {
			description: 'School created successfully',
			content: {
				'application/json': {
					schema: {
						type: 'object',
						properties: {
							id: { type: 'integer', description: 'ID of the created school' },
						},
					},
				},
			},
		},
	},
};
export async function updateSchool(req, res) {
	return NotImplemented(req, res);
}
updateSchool.openapi = {
	summary: 'Update School',
	description: 'Updates an existing school within the specified tournament.',
	tags: ['Schools'],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: { $ref: '#/components/schemas/UpdateSchool' },
			},
		},
	},
	responses: {
		200: {
			description: 'School updated successfully',
		},
		404 : { $ref: '#/components/responses/NotFound' },
	},
};
export async function deleteSchool(req, res) {
	return NotImplemented(req, res);
}
deleteSchool.openapi = {
	summary: 'Delete School',
	description: 'Deletes a school within the specified tournament.',
	tags: ['Schools'],
	responses: {
		204: {
			description: 'School deleted successfully',
		},
		404 : { $ref: '#/components/responses/NotFound' },
	},
};