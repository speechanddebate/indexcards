import permissionRepo from '../../api/repos/permissionRepo.js';

export function createPermissionData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function createTestPermission(overrides = {}) {
	const data = createPermissionData(overrides);
	const permissionId = await permissionRepo.createPermission(data);

	return {
		permissionId,
		getPermission: () => permissionRepo.getPermission(permissionId),
	};
}
export default {
	createPermissionData,
	createTestPermission,
};