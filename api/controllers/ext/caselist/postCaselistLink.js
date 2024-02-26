const postCaselistLink = {
	POST: async (req, res) => {
		const db = req.db;
		await db.sequelize.query(`
            INSERT INTO caselist (slug, eventcode, person)
            VALUES (?, ?, ?)
        `, { replacements: [req.body.slug.trim(), parseInt(req.body.eventcode) || 0, req.body.person_id] });

		return res.status(201).json({ message: 'Successfully created caselist link' });
	},
};

postCaselistLink.POST.apiDoc = {
	summary: 'Create a link to a caselist page',
	operationId: 'postCaselistLink',
	requestBody: {
		description: 'The caselist link',
		required: true,
		content: { '*/*': { schema: { $ref: '#/components/schemas/CaselistLink' } } },
	},
	responses: {
		200: {
			description: 'Caselist Link',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/CaselistLink' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
	tags: ['caselist'],
};

export default postCaselistLink;
