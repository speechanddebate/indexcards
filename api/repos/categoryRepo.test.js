import { describe, it, expect, vi, beforeEach } from 'vitest';
import categoryRepo from './categoryRepo.js';
import tournRepo from './tournRepo.js';


describe('createCategory', () => {
    it('creates category when provided valid data', async () => {
        const category = {
            name: 'Test Category'
        }
        const resultId = await categoryRepo.createCategory(category);
        expect(resultId).toBeDefined();
        const result = await categoryRepo.getCategory(resultId);
        expect(result).toBeDefined();
        expect(result.name).toBe(category.name);
    });
});
describe('getCategory', () => { 
    it('retrieves category by id', async () => {
        const category = {
            name: 'Test Category'
        }
        const resultId = await categoryRepo.createCategory(category);
        expect(resultId).toBeDefined();
        const result = await categoryRepo.getCategory(resultId);
        expect(result).toBeDefined();
        expect(result.name).toBe(category.name);
    });
    it('throws an error when id is not provided', async () => {
        await expect(categoryRepo.getCategory()).rejects.toThrow();
    });
	it('attaches judges when include.judges is true', async () => {
		const category = {
			name: 'Test Category'
		}
		const resultId = await categoryRepo.createCategory(category);
		expect(resultId).toBeDefined();
		const result = await categoryRepo.getCategory(resultId, { include: { judges: true } });
		expect(result).toBeDefined();
		expect(result.judges).toBeDefined();
		expect(Array.isArray(result.judges)).toBe(true);
	});
});
describe('getCategories', () => { 
    it('retrieves all categories for a given tournament', async () => {
        const tournId = await tournRepo.createTourn({ name: 'Test Tournament' });
        const category1 = {
            name: 'Test Category 1',
            tournId: tournId
        }
        const category2 = {
            name: 'Test Category 2',
            tournId: tournId
        }
        await categoryRepo.createCategory(category1);
        await categoryRepo.createCategory(category2);
        const results = await categoryRepo.getCategories({ tournId: tournId });
        expect(results).toBeDefined();
        expect(results.length).toBeGreaterThanOrEqual(2);
        expect(results.every(c => c.tournId === tournId)).toBe(true);
        expect(results.map(c => c.name)).toEqual(expect.arrayContaining([category1.name, category2.name]));
    });
    it('retrieves all categories when no scope is provided', async () => {
        const category1 = {
            name: 'Test Category 1'
        }
        const category2 = {
            name: 'Test Category 2'
        }
        await categoryRepo.createCategory(category1);
        await categoryRepo.createCategory(category2);
        const results = await categoryRepo.getCategories();
        expect(results).toBeDefined();
        expect(results.length).toBeGreaterThanOrEqual(2);
        expect(results.map(c => c.name)).toEqual(expect.arrayContaining([category1.name, category2.name]));
    });
	it('attaches judges when include.judges is true', async () => {
		const category = {
			name: 'Test Category'
		}
		const resultId = await categoryRepo.createCategory(category);
		expect(resultId).toBeDefined();
		const results = await categoryRepo.getCategories({},{ include: { judges: true } });
		expect(results).toBeDefined();
		expect(results[0].judges).toBeDefined();
		expect(Array.isArray(results[0].judges)).toBe(true);
	});
});
describe('deleteCategory', () => {
    it('deletes category by id', async () => {
        const category = {
            name: 'Test Category'
        }
        const resultId = await categoryRepo.createCategory(category);
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