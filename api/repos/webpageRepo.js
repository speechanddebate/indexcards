import db from '../data/db.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { FIELD_MAP,toDomain, toPersistence } from './mappers/webpageMapper.js';

function buildWebpageQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
		order: [['page_order', 'ASC']],
	};

	if (!opts.includeUnpublished) {
		query.where.published = 1;
	}

	return query;
}
export function webpageInclude(opts = {}) {
	return {
		model: db.webpage,
		as: 'webpages',
		...buildWebpageQuery(opts),
	};
}

async function getWebpage(webpageId, opts = {}) {
	if (!webpageId) throw new Error('getWebpage: WebpageId is required');
	const query = buildWebpageQuery(opts);
	query.where = {...query.where, id: webpageId};
	const webpage = await db.webpage.findOne(query);
	return toDomain(webpage);
}

async function getWebpages(scope, opts = {}) {
	const query = buildWebpageQuery(opts);

	if (scope && Object.keys(scope).length > 0) {
		for (const key of Object.keys(scope)) {
			if (key === 'tournId') {
				query.where.tourn = scope.tournId;
			} else if (key === 'sitewide') {
				query.where.sitewide = scope.sitewide;
			} else if (key === 'slug') {
				query.where.slug = scope.slug;
			}
			else {
				throw new Error(`Invalid webpage scope key: ${key}`);
			}
		}
	}

	const webpages = await db.webpage.findAll(query);
	return webpages.map(toDomain);
};

async function createWebpage(webpage) {
	const created = await db.webpage.create(
		toPersistence(webpage)
	);
	return created.id;
}
async function updateWebpage(webpageId, webpage) {
	if (!webpageId) throw new Error('updateWebpage: WebpageId is required for update');
	await db.webpage.update(
		toPersistence(webpage),
		{
			where: { id: webpageId },
		}
	);
	return webpageId;
}
async function deleteWebpage(webpageId) {
	if (!webpageId) throw new Error('deleteWebpage: WebpageId is required for delete');
	await db.webpage.destroy({
		where: { id: webpageId },
	});
	return webpageId;
}

export default {
	getWebpage,
	getWebpages,
	createWebpage,
	updateWebpage,
	deleteWebpage,
};