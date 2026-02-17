import tournRepo from '../../repos/tournRepo.js';
import permissionRepo from '../../repos/permissionRepo.js';
import { BadRequest, NotFound } from '../../helpers/problem.js';

async function getTourn(req, res) {
	const { tournId } = req.params;
	if(!tournId) return BadRequest(req,res,'Tournament ID is required');
	const tourn = await tournRepo.getTourn(tournId, { settings: true, unpublished: true });
	if (!tourn) return NotFound(req, res, 'Tournament not found');
	return res.json(tourn);
}

getTourn.openapi = {
	summary: 'Get tournament',
	tags: ['Tournament'],
	responses: {
		200: {
			description: 'Tournament information',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Tourn',
					},
				},
			},
		},
		404: { $ref: '#/components/responses/NotFound' },
	},
};
async function createTourn(req, res) {
	//TODO need to make the requesting user the owner of the tourn
	const data = req.body;
	const tournId = await tournRepo.createTourn(data);
	await permissionRepo.createPermission({
		tournId,
		personId: req.person.id,
		tag: 'owner',
	});
	const tourn = await tournRepo.getTourn(tournId);
	return res.status(201).json(tourn);
}
createTourn.openapi = {
	summary: 'Create tournament',
	tags: ['Tournament'],
	requestBody: {
		content: {
			'application/json': {
				schema: {
					$ref: '#/components/schemas/TournRequest',
				},
			},
		},
		required: true,
	},
	responses: {
		201: {
			description: 'Tournament created',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Tourn',
					},
				},
			},
		},
	},
};
async function updateTourn(req, res) {
	const { tournId } = req.params;
	if (!tournId) return BadRequest(req, res, 'Tournament ID is required');

	const updates = req.body;
	delete updates.id;

	await tournRepo.updateTourn(tournId, updates);

	const updatedTourn = await tournRepo.getTourn(tournId);
	return res.json(updatedTourn);
}
updateTourn.openapi = {
	summary: 'Update tournament',
	tags: ['Tournament'],
};

async function deleteTourn(req, res) {
	const { tournId } = req.params;
	if (!tournId) return BadRequest(req, res, 'Tournament ID is required');

	await tournRepo.deleteTourn(tournId);

	return res.status(204).send();
}

export default {
	getTourn,
	createTourn,
	updateTourn,
	deleteTourn,
};