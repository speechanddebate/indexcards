import db from '../data/db.js';
import { toDomain } from './mappers/webpageMapper.js';

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

	return webpages.map(toDomain);
};

export default {
	getWebpages,
};