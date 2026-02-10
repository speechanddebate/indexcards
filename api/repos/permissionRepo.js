import db from '../data/db.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/permissionMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildPermissionQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};
	return query;
}

async function getPermission(id, opts = {}) {
	const permission = await db.permission.findByPk(id, {
		...buildPermissionQuery(opts),
	});
	return toDomain(permission);
}
async function getPermissions(scope = {}, opts = {}) {
	const query = buildPermissionQuery(opts);
	query.where = {
		...query.where,
		...Object.fromEntries(
			Object.entries(scope)
				.filter(([key, value]) => value !== undefined && FIELD_MAP[key] && FIELD_MAP[key].db)
				.map(([key, value]) => [FIELD_MAP[key].db, value])
		),
	};
	const permissions = await db.permission.findAll(query);
	return permissions.map(toDomain);
}

async function createPermission(data) {
	const permission = await db.permission.create(toPersistence(data));
	return permission.id;
}

export default {
	getPermission,
	getPermissions,
	createPermission,
};