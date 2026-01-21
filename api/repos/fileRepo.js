import db from '../data/db.js';
import { toDomain } from './mappers/fileMapper.js';

export async function getFiles({
	scope = {},
	includeUnpublished = false,
} = {}
) {
	const where = {};

	if (!includeUnpublished) {
		where.published = 1;
	}

	if (scope && Object.keys(scope).length > 0) {
		for (const key of Object.keys(scope)) {
			if (key === 'tournId') {
				where.tourn = scope.tournId;
			} else {
				throw new Error(`Invalid file scope key: ${key}`);
			}
		}
	}

	const files = await db.file.findAll({
		where,
		raw: true,
		order: ['tag', 'label'],
	});

	return files.map(toDomain);
};
export default {
	getFiles,
};