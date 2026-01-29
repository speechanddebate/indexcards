import db from '../data/db.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/siteMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildSiteQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};
	if (opts.include?.rooms) {
		query.include.push({
			model: db.room,
			as: 'rooms',
		});
	}
	return query;
}

async function getSites(scope, opts = {}) {
	const query = buildSiteQuery(opts);

	// Base filters
	if (scope?.circuitId) {
		query.where = { ...query.where, circuit: scope.circuitId };
	}

	// Join-only filter via tourn_sites
	if (scope?.tournId) {
		query.include = query.include || [];

		query.include.push({
			model: db.tournSite,
			as: 'tourn_sites',
			required: true,
			where: { tourn: scope.tournId },
			attributes: [], // join-only
		});
	}

	const sites = await db.site.findAll(query);
	return sites.map(toDomain);
}

async function createSite(siteData) {
	const persistenceData = toPersistence(siteData);
	const newSite = await db.site.create(persistenceData);
	if (siteData.tournId) {
		// Create entry in tourn_sites junction table
		await db.tournSite.create({
			tourn: siteData.tournId,
			site: newSite.id,
		});
	}
	return newSite.id;
}

export default {
	getSites,
	createSite,
};