export const getProfile = {
	GET: async (req, res) => {

		if (!req.session) {
			return res.status(201).json({ message: 'You have no active user session' });
		}
		let person;

		if (req.params.person_id && req.session.site_admin) {
			person = await req.db.person.findByPk(
				req.params.person_id,
				{
					include: [{
						model: req.db.personSetting,
						as: 'Settings',
					}],
				}
			);

		} else if (req.params.person_id ) {
			return res.status(201).json({ message: 'Only admin staff may access another profile' });
		} else if (req.session.person) {
			person = await req.db.person.findByPk(req.session.person,
				{
					include: [{
						model: req.db.personSetting,
						as: 'Settings',
					}],
				},
			);
		}

		if (person.count < 1) {
			return res.status(400).json({ message: 'User does not exist' });
		}

		const personData = person.dataValues;

		personData.settings = {};

		console.log(personData.Settings);

		for (const set of personData.Settings) {
			const setting = set.dataValues;

			if (setting.value === 'text' || setting.value === 'json') {
				personData.settings[setting.tag] = setting.alue_text;
			} else if (setting.value === 'date') {
				personData.settings[setting.tag] = setting.value_date;
			} else if (setting.value) {
				personData.settings[setting.tag] = setting.value;
			}
		}

		delete personData.Settings;
		delete personData.password;

		return res.status(200).json(personData);
	},
};

getProfile.GET.apiDoc = {
	summary: 'Load the profile data of the logged in user',
	operationId: 'getProfile',
	parameters: [
		{
			in          : 'path',
			name        : 'person_id',
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
