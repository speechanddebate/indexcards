export const getPageBySlug = {

	GET: async (req, res) => {

		const db = req.db;
		const pageSlug = req.params.slug;

		const page = await db.sequelize.query(`
			select
				id, title, slug, content, published, sitewide, special, page_order, sidebar
			from webpage page
			where 1=1
				and page.sitewide = 1
				and page.published = 1
				and page.slug = :pageSlug
		`, {
			replacements : { pageSlug },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(page);
	},
};

export const getAllPages = {

	GET: async (req, res) => {

		const db = req.db;

		const publicPages = await db.sequelize.query(`
			select
				id, title, slug, content, published, sitewide, special, page_order, sidebar
			from webpage page
			where 1=1
				and page.sitewide = 1
				and page.published = 1
		`, {
			type: db.sequelize.QueryTypes.SELECT,
		});
		res.status(200).json(publicPages);
	},
};

export const getPagesByTourn = {

	GET: async (req, res) => {
		const db = req.db;
		const pages = await db.sequelize.query(`
			select
				id, title, slug, content, published, sitewide, special, page_order, parent, sidebar
			from webpage page
			where 1=1
				and page.published = 1
				and page.tourn = :tournId
		`, {
			replacements : { tournId: req.params.tournId },
			type         : db.sequelize.QueryTypes.SELECT,
		});
		res.status(200).json(pages);
	},
};

export default getAllPages;

getAllPages.GET.apiDoc = {
	summary     : 'Return all the public sitewide pages in Tabroom',
	operationId : 'getAllPages',
	tags        : ['public'],
	responses: {
		200: {
			description: 'Page',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Page' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};

getPageBySlug.GET.apiDoc = {
	summary     : 'Return public sitewide pages in Tabroom with a particular slug',
	operationId : 'getPageBySlug',
	tags        : ['public'],
	parameters: [
		{
			in          : 'path',
			name        : 'slug',
			description : 'Slug key of the public website',
			required    : true,
			schema      : {
				type    : 'string',
				minimum : 1,
			},
		},
	],
	responses: {
		200: {
			description: 'Page',
			content: {
				'*/*': {
					schema: {
						type: 'array',
						items: { $ref: '#/components/schemas/Page' },
					},
				},
			},
		},
		default: { $ref: '#/components/responses/ErrorResponse' },
	},
};
