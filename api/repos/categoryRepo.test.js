
import factories from '../../tests/factories/index.js';
import categoryRepo from './categoryRepo.js';

describe('createCategory', () => {
	it('creates category when provided valid data', async () => {
		const category = {
			name: 'Test Category',
		};
		const resultId = await categoryRepo.createCategory(category);
		expect(resultId).toBeDefined();
		const result = await categoryRepo.getCategory(resultId);
		expect(result).toBeDefined();
		expect(result.name).toBe(category.name);
	});
});
describe('getCategory', () => {
	it('retrieves category by id', async () => {
		const categoryData = factories.category.createCategoryData();
		const resultId = await categoryRepo.createCategory(categoryData);
		expect(resultId).toBeDefined();
		const result = await categoryRepo.getCategory(resultId);
		expect(result).toBeDefined();
		expect(result.name).toBe(categoryData.name);
	});
	it('throws an error when id is not provided', async () => {
		await expect(categoryRepo.getCategory()).rejects.toThrow();
	});
	it('attaches judges when include.judges is true', async () => {
		const categoryData = factories.category.createCategoryData();
		const resultId = await categoryRepo.createCategory(categoryData);
		expect(resultId).toBeDefined();
		const result = await categoryRepo.getCategory(resultId, { include: { judges: true } });
		expect(result).not.toBeNull();
		expect(result.judges).toBeDefined();
		expect(Array.isArray(result.judges)).toBe(true);
	});
});
describe('getCategories', () => {
	it('retrieves all categories for a given tournament', async () => {
		const { tournId } = await factories.tourn.createTestTourn();
		const category1Data = factories.category.createCategoryData({ tournId });
		const category2Data = factories.category.createCategoryData({ tournId });

		await categoryRepo.createCategory(category1Data);
		await categoryRepo.createCategory(category2Data);
		const results = await categoryRepo.getCategories({ tournId: tournId });
		expect(results).toBeDefined();
		expect(results.length).toBeGreaterThanOrEqual(2);
		results.forEach(c => {
			expect(c.tournId, `expected tournId to be ${tournId} but was ${c.tournId}`).toBe(tournId);
		});
		expect(results.map(c => c.name)).toEqual(expect.arrayContaining([category1Data.name, category2Data.name]));
	});
	it('retrieves all categories when no scope is provided', async () => {
		const category1Data = factories.category.createCategoryData();
		const category2Data = factories.category.createCategoryData();

		await categoryRepo.createCategory(category1Data);
		await categoryRepo.createCategory(category2Data);
		const results = await categoryRepo.getCategories();
		expect(results).toBeDefined();
		expect(results.length).toBeGreaterThanOrEqual(2);
		expect(results.map(c => c.name)).toEqual(expect.arrayContaining([category1Data.name, category2Data.name]));
	});
	it('attaches judges when include.judges is true', async () => {
		const categoryData = factories.category.createCategoryData();
		const resultId = await categoryRepo.createCategory(categoryData);
		expect(resultId).toBeDefined();
		const results = await categoryRepo.getCategories({},{ include: { judges: true } });
		expect(results).toBeDefined();
		expect(results[0].judges).toBeDefined();
		expect(Array.isArray(results[0].judges)).toBe(true);
	});
});
describe('deleteCategory', () => {
	it('deletes category by id', async () => {
		const categoryData = factories.category.createCategoryData();
		const resultId = await categoryRepo.createCategory(categoryData);
		expect(resultId).toBeDefined();
		const deleteResult = await categoryRepo.deleteCategory(resultId);
		expect(deleteResult).toBe(1);
		const result = await categoryRepo.getCategory(resultId);
		expect(result).toBeNull();
	});
	it('throws an error when id is not provided', async () => {
		await expect(categoryRepo.deleteCategory()).rejects.toThrow();
	});
});