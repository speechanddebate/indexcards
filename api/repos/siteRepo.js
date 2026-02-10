
import db from '../data/db.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/siteMapper.js';
import { roomInclude } from './roomRepo.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildSiteQuery(opts = {}, scope = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	// Base filters
	if (scope?.circuitId) {
		query.where = { ...query.where, circuit: scope.circuitId };
	}

	// Join-only filter via tourn_sites
	if (scope?.tournId) {
		query.include.push({
			model: db.tournSite,
			as: 'tourn_sites',
			required: true,
			where: { tourn: scope.tournId },
			attributes: [], // join-only
		});
	}

	if (opts.include?.rooms) {
		query.include.push({
			...roomInclude(opts.include.rooms),
			as: 'rooms',
			required: false,
		});
	}

	return query;
}

export function siteInclude(opts = {}) {
	return {
		model: db.site,
		as: 'site_site',
		...buildSiteQuery(opts),
	};
}

async function getSite(ref, opts = {}) {
	if (!ref) throw new Error('getSite: id or scope is required');

	const isScoped = typeof ref === 'object';
	const siteId = isScoped ? ref.siteId : ref;

	if (!siteId) throw new Error('getSite: siteId is required');

	const scope = isScoped ? { ...ref } : {};
	delete scope.siteId;

	const query = buildSiteQuery(opts, scope);

	query.where.id = siteId;

	const site = await db.site.findOne(query);
	return toDomain(site);
}

async function getSites(scope, opts = {}) {
	const query = buildSiteQuery(opts,scope);
	const sites = await db.site.findAll(query);
	return sites.map(toDomain);
}

async function createSite(siteData) {
	const persistenceData = toPersistence(siteData);
	const newSite = await db.site.create(persistenceData);
	return newSite.id;
}

async function updateSite(siteId, siteData) {
	if (!siteId) throw new Error('updateSite: Site ID is required');
	const persistenceData = toPersistence(siteData);
	const [result] = await db.site.update(persistenceData, {
		where: { id: siteId },
	});
	return result > 0;
}

async function deleteSite(id) {
	if (!id) throw new Error('deleteSite: Site ID is required');
	const rows = await db.site.destroy({where: { id }});
	return rows > 0;
}

export default {
	getSite,
	getSites,
	createSite,
	updateSite,
	deleteSite,
};