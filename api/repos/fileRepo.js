import db from '../data/db.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/fileMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildFileQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
		order: [['tag', 'ASC'],['label', 'ASC']],
	};

	if (!opts.unpublished) {
		query.where.published = 1;
	}

	return query;
}

export function fileInclude(opts = {}) {
	return {
		model: db.file,
		as: 'files',
		...buildFileQuery(opts),
	};
}
export async function getFile(id, opts = {}) {
	const query = buildFileQuery(opts);
	query.where = {...query.where, id};
	const file = await db.file.findOne(query);
	return toDomain(file);
}

export async function getFiles(scope = {}, opts = {}) {
	const query = buildFileQuery(opts);

	for (const key of Object.keys(scope)) {
		if (key === 'tournId') {
			query.where = {...query.where, tourn: scope.tournId};
		} else {
			throw new Error(`Invalid file scope key: ${key}`);
		}
	}

	const files = await db.file.findAll(query);
	return files.map(toDomain);
}

async function createFile(data) {
	const createdFile = await db.file.create(toPersistence(data));
	return createdFile.id;
}

export default {
	getFile,
	getFiles,
	createFile,
};
