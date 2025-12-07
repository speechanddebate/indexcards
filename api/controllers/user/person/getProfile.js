import personRepo from '../../../repos/personRepo.js';

export const getProfile = {
	GET: async (req, res) => {

		if (!req.session) {
			return res.status(401).json({ message: 'You have no active user session' });
		}
		let person;

		if (req.params.personId && req.session.site_admin) {
			person = await personRepo.getPersonByIdWithSettings(req.params.personId);

		} else if (req.params.personId ) {
			return res.status(401).json({ message: 'Only admin staff may access another profile' });
		} else if (req.session.person) {
			person = await personRepo.getPersonByIdWithSettings(req.session.person);
		}

		if (!person) {
			return res.status(400).json({ message: 'User does not exist' });
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
