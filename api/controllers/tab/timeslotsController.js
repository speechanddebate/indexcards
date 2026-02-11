import timeslotRepo from '../../repos/timeslotRepo.js';
import { NotFound, BadRequest } from '../../helpers/problem.js';
import { assert } from '../../helpers/validator.js';
import { ValidationError } from '../../helpers/errors/errors.js';

//tourns/:tournId/timeslots/:timeslotId
async function getTimeslot(req, res) {
	const timeslot = await timeslotRepo.getTimeslot({id: req.params.timeslotId, tournId: req.params.tournId});
	if (!timeslot) return NotFound(req,res,'Timeslot not found');
	return res.json(timeslot);
}
getTimeslot.openapi = {
	summary: 'Get a timeslot by ID',
	description: 'Returns a timeslot object for the given ID.',
	tags: ['Timeslots'],
	responses: {
		200: {
			description: 'A timeslot object',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/TimeslotResponse',
					},
					examples: {
						timeslotResponse: {
							summary: 'Example response',
							value: {
								id: 1,
								name: 'Round 1',
								start: '2023-01-01T09:00:00Z',
								end: '2023-01-01T10:00:00Z',
								tournId: 42,
								createdAt: '2023-01-01T00:00:00Z',
								updatedAt: '2023-01-02T00:00:00Z',
							},
						},
					},
				},
			},
		},
	},
};

//tourns/:tournId/timeslots
async function getTimeslots(req, res) {
	const tournId = req.params.tournId;
	const timeslots = await timeslotRepo.getTimeslots({ tournId });
	if (!timeslots) return NotFound(req,res,'Timeslots not found');
	return res.json(timeslots);

}
getTimeslots.openapi = {
	summary: 'Get all timeslots for a tournament',
	description: 'Returns an array of timeslot objects for the given tournament.',
	tags: ['Timeslots'],
	responses: {
		200: {
			description: 'An array of timeslot objects',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/TimeslotResponse' },
					},
					examples: {
						timeslotsResponse: {
							summary: 'Example response',
							value: [
								{
									id: 1,
									name: 'Round 1',
									start: '2023-01-01T09:00:00Z',
									end: '2023-01-01T10:00:00Z',
									tournId: 42,
									createdAt: '2023-01-01T00:00:00Z',
									updatedAt: '2023-01-02T00:00:00Z',
								},
								{
									id: 2,
									name: 'Round 2',
									start: '2023-01-01T10:30:00Z',
									end: '2023-01-01T11:30:00Z',
									tournId: 42,
									createdAt: '2023-01-01T00:00:00Z',
									updatedAt: '2023-01-02T00:00:00Z',
								},
							],
						},
					},
				},
			},
		},
	},
};

//tourns/:tournId/timeslots
async function createTimeslot(req, res) {
	const timeslotData = req.body;
	if (timeslotData?.tournId && Number(timeslotData.tournId) !== Number(req.params.tournId)) {
		return BadRequest(req, res, 'Tournament ID in body does not match URL');
	}
	try {
		const timeslot = await upsertTimeslot(timeslotData);
		return res.status(201).json(timeslot);
	} catch (err) {
		if (err instanceof ValidationError) {
			return BadRequest(req, res, err.message);
		}
		throw err;
	}
}
createTimeslot.openapi = {
	summary: 'Create a new timeslot',
	description: 'Creates a new timeslot with the provided data and returns the created object.',
	tags: ['Timeslots'],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: {
					$ref: '#/components/schemas/TimeslotRequest',
				},
				examples: {
					timeslotRequest: {
						summary: 'Example request',
						value: {
							name: 'Round 1',
							start: '2023-01-01T09:00:00Z',
							end: '2023-01-01T10:00:00Z',
							tournId: 42,
						},
					},
				},
			},
		},
	},
};

//tourns/:tournId/timeslots/:timeslotId
async function updateTimeslot(req, res) {
	const timeslotData = req.body;
	if (!req.params.timeslotId) {
		return BadRequest(req, res, 'Timeslot ID is required');
	}
	if (timeslotData.id && Number(timeslotData.id) !== Number(req.params.timeslotId)) {
		return BadRequest(req, res, 'Timeslot ID in body does not match URL');
	}
	timeslotData.id = req.params.timeslotId;
	try {
		const timeslot = await upsertTimeslot(timeslotData);
		return res.json(timeslot);
	} catch (err) {
		if (err instanceof ValidationError) {
			return BadRequest(req, res, err.message);
		}
		throw err;
	}
}
updateTimeslot.openapi = {
	summary: 'Update an existing timeslot',
	description: 'Updates the timeslot with the given ID using the provided data and returns the updated object.',
	tags: ['Timeslots'],
	requestBody: {
		required: true,
		content: {
			'application/json': {
				schema: {
					$ref: '#/components/schemas/TimeslotRequest',
				},
				examples: {
					timeslotRequest: {
						summary: 'Example request',
						value: {
							name: 'Round 1 - Updated',
							start: '2023-01-01T09:30:00Z',
							end: '2023-01-01T10:30:00Z',
							tournId: 42,
						},
					},
				},
			},
		},
	},
};

//tourns/:tournId/timeslots/:timeslotId
async function deleteTimeslot(req, res) {
	const timeslotId = req.params.timeslotId;
	const deleted = await timeslotRepo.deleteTimeslot(timeslotId);
	if (!deleted) {
		return NotFound(req,res,'Timeslot not found for deletion');
	}
	return res.status(204).send();

}
deleteTimeslot.openapi = {
	summary: 'Delete a timeslot',
	description: 'Deletes the timeslot with the given ID and returns a success message.',
	tags: ['Timeslots'],
};

/**
 * Upsert a timeslot (create or update based on existence)
 * If this function is ever needed outside of this file, move to a service module
 */
async function upsertTimeslot(data) {

	assert.present(data.name, 'Timeslot name is required');
	assert.present(data.start, 'Timeslot start time is required');
	assert.present(data.end, 'Timeslot end time is required');
	assert.present(data.tournId, 'Tournament ID is required');
	assert.validDate(data.start, 'Timeslot start time must be a valid date');
	assert.validDate(data.end, 'Timeslot end time must be a valid date');
	if(new Date(data.start) >= new Date(data.end)){
		throw new ValidationError('Start time must be before end time');
	}

	let id = data.id;

	if(id) {
		id = await timeslotRepo.updateTimeslot(data.id, data);
	}
	else {
		id = await timeslotRepo.createTimeslot(data);
		if(!id) {
			throw new Error('Failed to create timeslot');
		}
	}
	return timeslotRepo.getTimeslot(id);
}

export default {
	getTimeslot,
	getTimeslots,
	createTimeslot,
	updateTimeslot,
	deleteTimeslot,
};