
import db from '../data/db.js';
import { withSettingsInclude } from './utils/settings.js';
import { FIELD_MAP,toDomain, toPersistence } from './mappers/categoryMapper.js';
import { judgeInclude } from './judgeRepo.js';
import { jPoolInclude } from './jpoolRepo.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildCategoryQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if (opts?.include?.judges) {
		const judge = judgeInclude(opts.include.judges);
		judge.as = 'judges';
		judge.required = false;
		query.include.push(judge);
	}
	if (opts?.include?.jpools) {
		const jpool = jPoolInclude(opts.include.jpools);
		jpool.as = 'jpools';
		jpool.required = false;
		query.include.push(jpool);
	}

	// Category settings
	query.include.push(
		...withSettingsInclude({
			model: db.categorySetting,
			as: 'category_settings',
			settings: opts.settings,
		})
	);

	return query;
}

export function categoryInclude(opts = {}) {
	return {
		model: db.category,
		as: 'categories',
		...buildCategoryQuery(opts),
	};
}

async function getCategory(id, opts = {}) {
	if (!id) throw new Error('getCategory: id is required');
	const query = buildCategoryQuery(opts);
	query.where = { id, ...query.where };
	const dbRow = await db.category.findOne(query);
	return toDomain(dbRow);
}
async function getCategories(scope, opts = {}) {
	const query = buildCategoryQuery(opts);
	if (scope?.tournId) {
		query.where.tourn = scope.tournId;
	}
	const dbRows = await db.category.findAll(query);
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
