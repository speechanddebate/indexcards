import webpageRepo from '../../repos/webpageRepo.js';
import { ToPublicPage } from '../mappers/pageMapper.js';

/** Get a list of the public, sitewide pages
 */
export async function getPublicPages(req,res){
	const scope = {
		sitewide: true,
	};

	if (req.params.slug) {
		scope.slug = req.params.slug;
	}

	const pages = await webpageRepo.getWebpages({
		scope,
	});

	if (req.params.slug) {
		if (!pages.length) {
			return res.status(404).json({ message: 'Page with not found' });
		}
		return res.json(ToPublicPage(pages[0]));
	}

	res.json(pages.map(ToPublicPage));
}
getPublicPages.openapi = {
	get: {
		summary: 'Get Public Page By Slub',
		description: "Retrieve a public, sitewide page by it's slug",
		tags: ['Webpages'],
		security: [],
		responses: {
			200: {
				description: 'A public webpages',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/WebPage',
						},
					},
				},
			},
			404: {
				$ref: '#/components/responses/NotFound',
			},
		},
	},
	list: {
		summary: 'Get Public Pages',
		description: 'Retrieve a list of public, sitewide pages',
		tags: ['Webpages'],
		security: [],
		responses: {
			200: {
				description: 'List of public webpages',
				content: {
					'application/json': {
						schema: {
							type: 'array',
							items: {
								$ref: '#/components/schemas/WebPage',
							},
						},
					},
				},
			},
			404: {
				$ref: '#/components/responses/NotFound',
			},
		},
	},
};
