import { BadRequest, Forbidden, Unauthorized } from '../../../helpers/problem.js';
import personRepo from '../../../repos/personRepo.js';

export const getProfile = {
	GET: async (req, res) => {

		if (!req.person) {
			return Unauthorized(res, 'You have no active user session');
		}
		let person;

		if (req.params.personId && req.person.siteAdmin) {
			person = await personRepo.getPersonByIdWithSettings(req.params.personId);

		} else if (req.params.personId ) {
			return Forbidden(res,'Only admin staff may access another profile');
		} else if (req.person) {
			person = await personRepo.getPersonByIdWithSettings(req.person.id);
		}

		if (!person) {
			return BadRequest(res, 'User does not exist');
		}

		return res.status(200).json(person);
	},
};

getProfile.GET.apiDoc = {
	summary: 'Load the profile data of the logged in user',
	operationId: 'getProfile',
	parameters: [
		{
			in          : 'path',
			name        : 'personId',
			description : 'ID of user whose profile you wish to access.  Defaults to present session.',
			required    : false,
			schema      : {
				type    : 'integer',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Person Profile',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Person' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['accounts'],
};

export default getProfile;
