
import permissionRepo from './permissionRepo.js';
import factories from '../../tests/factories/index.js';

let personId = null;

describe('permissionRepo', () => {
	beforeAll(async () => {
		({ personId } = await factories.person.createTestPerson());
	});
	describe('getPermissions', () => {
		it('should return permissions for a given personId', async () => {
			const permissionId = await permissionRepo.createPermission({ personId });
			const permissions = await permissionRepo.getPermissions({ personId });
			expect(Array.isArray(permissions)).toBe(true);
			expect(permissions.length).toBeGreaterThan(0);
			const found = permissions.find(b => b.id === permissionId);
			expect(found).toBeDefined();
			expect(found.personId).toBe(personId);
		});

		it('should return all permissions when no scope is provided', async () => {
			// Create at least one permission to ensure there is data
			await permissionRepo.createPermission({ personId });
			const permissions = await permissionRepo.getPermissions();
			expect(Array.isArray(permissions)).toBe(true);
			expect(permissions.length).toBeGreaterThan(0);
		});
	});
	describe('createPermission', () => {
		it('should create a permission and retrieve it', async () => {
			const permissionId = await permissionRepo.createPermission({ personId });
			const permission = await permissionRepo.getPermission(permissionId);

			//ensure that id, updatedAt and createdAt are present and not null
			expect(permission).toHaveProperty('id');
			expect(permission.id).not.toBeNull();
			expect(permission).toHaveProperty('updatedAt');
			expect(permission.updatedAt).not.toBeNull();
			expect(permission).toHaveProperty('createdAt');
			expect(permission.createdAt).not.toBeNull();
		});
	});

});