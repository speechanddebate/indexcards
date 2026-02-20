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
