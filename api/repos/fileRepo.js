import db from '../data/db.js';
import { baseRepo } from './baseRepo.js';

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

	return files.map(mapFile);
};

function mapFile(fileInstance) {
	if (!fileInstance) return null;
	return {
		id: fileInstance.id,
		tag: fileInstance.tag,
		type: fileInstance.type,
		label: fileInstance.label,
		filename: fileInstance.filename,
		published: fileInstance.published,
		coach: fileInstance.coach,
		pageOrder: fileInstance.page_order,
		uploaded: fileInstance.uploaded,
		billCategory: fileInstance.bill_category,
		tournId: fileInstance.tourn,
		schoolId: fileInstance.school,
		entryId: fileInstance.entry,
		eventId: fileInstance.event,
		districtId: fileInstance.district,
		circuitId: fileInstance.circuit,
		parentId: fileInstance.parent,
		personId: fileInstance.person,
		lastModified: fileInstance.timestamp,
	};
};
export default {
	...baseRepo(db.file, mapFile),
	getFiles,
};