import db from '../data/db.js';
import { withSettingsInclude } from './utils/settings.js';
import { toDomain, toPersistence } from './mappers/categoryMapper.js';

async function getCategory(id, opts = {}) {
	if (!id) throw new Error('getCategory: id is required');
	const dbRow = await db.category.findByPk(id, {
		include: [
			...withSettingsInclude({
				model: db.categorySetting,
				as: 'category_settings',
				settings: opts.settings,
			}),
		],
	});

	if (!dbRow) return null;

	return toDomain(dbRow);
}
async function getCategories(scope, opts = {}) {
	const where = {};
	if (scope?.tournId) {
		where.tourn = scope.tournId;
	}

	const dbRows = await db.category.findAll({
		where,
		include: [
			...withSettingsInclude({
				model: db.categorySetting,
				as: 'category_settings',
				settings: opts.settings,
			}),
		],
	});

	return dbRows.map(toDomain);
}
async function createCategory(data, opts = {}) {
	const dbRow = await db.category.create(toPersistence(data));
	return dbRow.id;
}
async function deleteCategory(id) {
	if (!id) throw new Error('deleteCategory: id is required');
	const rows = await db.category.destroy({
		where: { id },
	});
	return rows;
}

export default {
	getCategory,
	getCategories,
	createCategory,
	deleteCategory,
};
