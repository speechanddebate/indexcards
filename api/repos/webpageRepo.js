import db from '../data/db.js';
import { baseRepo } from './baseRepo.js';

export async function getWebpages({
	scope = {},
	includeUnpublished = false,
} = {}
) {
	const where = {};

	if (!includeUnpublished) {
		where.published = 1;
	}

	if (scope && Object.keys(scope).length > 0) {
		for (const key of Object.keys(scope)) {
			if (key === 'tournId') {
				where.tourn = scope.tournId;
			} else if (key === 'sitewide') {
				where.sitewide = scope.sitewide;
			} else if (key === 'slug') {
				where.slug = scope.slug;
			}
			else {
				throw new Error(`Invalid webpage scope key: ${key}`);
			}
		}
	}

	const webpages = await db.webpage.findAll({
		where,
		raw: true,
		order: ['page_order'],
	});

	return webpages.map(mapWebpage);
};

function mapWebpage(pageInstance) {
	if (!pageInstance) return null;

	return {
		id: pageInstance.id,
		title: pageInstance.title,
		slug: pageInstance.slug,
		content: pageInstance.content,
		sidebar: pageInstance.sidebar,
		published: pageInstance.published,
		sitewide: pageInstance.sitewide,
		special: pageInstance.special,
		pageOrder: pageInstance.page_order,
		tournId: pageInstance.tourn,
		parentId: pageInstance.parent,
		lastEditorId: pageInstance.last_editor,
		timestamp: pageInstance.timestamp,
		createdAt: pageInstance.created_at,
	};
}
export default {
	...baseRepo(db.webpage, mapWebpage),
	getWebpages,
};