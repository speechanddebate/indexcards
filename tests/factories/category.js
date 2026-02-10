import categoryRepo from '../../api/repos/categoryRepo.js';
import { fakeCategory } from './factoryUtils.js';

export function createCategoryData(overrides = {}) {
	const category = fakeCategory();
	return {
		name: category.name,
		abbr: category.abbr,
		...overrides,
	};
}

export async function createTestCategory(overrides = {}) {
	const data = createCategoryData(overrides);
	const categoryId = await categoryRepo.createCategory(data);

	return {
		categoryId,
		getCategory: () => categoryRepo.getCategory(categoryId, { settings: true }),
	};
}
export default {
	createTestCategory,
	createCategoryData,
};