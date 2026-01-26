import db from '../data/db.js';
import { toDomain,toPersistence } from './mappers/siteMapper.js';

async function getSites(scope, opts ={}) {
	const where = {};
	let include = [];

	if (scope && scope.tournId) {
		// Join tourn_sites if tournId is specified
		include.push({
			model: db.tournSite,
			as: 'tourn_sites',
			required: true,
			where: { tourn: scope.tournId },
			attributes: ['tourn'],
		});
	} else if (scope && scope.circuitId) {
		// Filter by circuit if circuitId is specified
		where.circuit = scope.circuitId;
	}

	if (opts && opts.include?.rooms) {
		include.push({
			model: db.room,
			as: 'rooms',
			foreignKey: 'site', // room.site is the site id
		});
	}

	const sites = await db.site.findAll({
		where,
		...(include.length > 0 ? { include } : {}),
	});

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
	return toDomain(newSite);
}

export default {
	getSites,
	createSite,
};