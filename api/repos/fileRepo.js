import db from '../data/db.js';
import { toDomain } from './mappers/fileMapper.js';

function buildFileQuery(opts = {}) {
	const where = {};

	if (!opts.includeUnpublished) {
		where.published = 1;
	}

	return {
		where,
		include: [],
		order: [
			['tag', 'ASC'],
			['label', 'ASC'],
		],
	};
}

export function fileInclude(opts = {}) {
	return {
		model: db.file,
		as: 'files',
		...buildFileQuery(opts),
	};
}

export async function getFiles(scope = {}, opts = {}) {
	const scopeWhere = {};

	for (const key of Object.keys(scope)) {
		if (key === 'tournId') {
			scopeWhere.tourn = scope.tournId;
		} else {
			throw new Error(`Invalid file scope key: ${key}`);
		}
	}

	const baseQuery = buildFileQuery(opts);

	const files = await db.file.findAll({
		...baseQuery,
		where: {
			...baseQuery.where,
			...scopeWhere,
		},
	});

	return files.map(toDomain);
}

export default {
	getFiles,
};
