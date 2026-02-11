
import schoolRepo from './schoolRepo.js';

describe('getSchool', () => {
	it('Returns null when school does not exist', async () => {
		const result = await schoolRepo.getSchool(99999);
		expect(result).toBeNull();
	});
});
describe('createSchool', () => {
	it('Creates a new school when given valid data', async () => {
		// Arrange
		const schoolData = {
			name: 'Test School',
			code: 'TS123',
			onsite: true,
			settings: {
				contact: 500,
			},
		};

		// Act
		const createdId = await schoolRepo.createSchool(schoolData);

		// Assert
		expect(createdId).toBeDefined();

		const fetchedSchool = await schoolRepo.getSchool(createdId, { settings: true });
		expect(fetchedSchool).toBeDefined();
		expect(fetchedSchool.name).toBe(schoolData.name);
		expect(fetchedSchool.code).toBe(schoolData.code);
		expect(fetchedSchool.onsite).toBe(schoolData.onsite);
		expect(fetchedSchool.settings).toEqual(schoolData.settings);

	});
	it('Creates a new school without settings when settings are not provided', async () => {
		// Arrange
		const schoolData = {
			name: 'No Settings School',
			code: 'NSS123',
			onsite: false,
		};

		// Act
		const createdId = await schoolRepo.createSchool(schoolData);

		// Assert
		expect(createdId).toBeDefined();

		const fetchedSchool = await schoolRepo.getSchool(createdId, { settings: true });
		expect(fetchedSchool).toBeDefined();
		expect(fetchedSchool.name).toBe(schoolData.name);
		expect(fetchedSchool.code).toBe(schoolData.code);
		expect(fetchedSchool.onsite).toBe(schoolData.onsite);
		expect(fetchedSchool.settings).toEqual({});
	});
});
describe('updateSchool', () => {
	let createdId;

	beforeEach(async () => {
		// Create a school to update
		const schoolData = {
			name: 'Update Test School',
			code: 'UTS123',
			onsite: true,
			settings: {
				contact: 600,
			},
		};
		createdId = await schoolRepo.createSchool(schoolData);
	});

	it('Updates existing school fields', async () => {
		// Arrange
		const updateData = {
			name: 'Updated School Name',
			code: 'USN456',
			onsite: false,
		};

		// Act
		await schoolRepo.updateSchool(createdId, updateData);

		// Assert
		const updatedSchool = await schoolRepo.getSchool(createdId, { settings: true });
		expect(updatedSchool.name).toBe(updateData.name);
		expect(updatedSchool.code).toBe(updateData.code);
		expect(updatedSchool.onsite).toBe(updateData.onsite);
		expect(updatedSchool.settings).toEqual({ contact: 600 }); // settings should remain unchanged
	});
});
describe('deleteSchool', () => {
	let createdId;

	beforeEach(async () => {
		// Create a school to delete
		const schoolData = {
			name: 'Delete Test School',
			code: 'DTS123',
			onsite: true,
			settings: {
				contact: 700,
			},
		};
		createdId = await schoolRepo.createSchool(schoolData);
	});

	it('Deletes an existing school and returns 1', async () => {
		// Act
		const result = await schoolRepo.deleteSchool(createdId);

		// Assert
		expect(result).toBe(1);

		const fetchedSchool = await schoolRepo.getSchool(createdId);
		expect(fetchedSchool).toBeNull();
	});

	it('Returns 0 when trying to delete a non-existent school', async () => {
		// Act
		const result = await schoolRepo.deleteSchool(999999);

		// Assert
		expect(result).toBe(0);
	});

	it('Throws an error if id is not provided', async () => {
		// Act & Assert
		await expect(schoolRepo.deleteSchool()).rejects.toThrow();
	});
});