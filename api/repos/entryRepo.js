import db from '../data/db.js';
import { FIELD_MAP } from './mappers/entryMapper.js';
import { studentInclude } from './studentRepo.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { saveSettings } from './utils/settings.js';
/**
 * maps entry relations to objects.
 */
function entryMapper(data){
	if(data.entry_students){
		data.Students = data.entry_students.map(es => es.student_student);
	}
	return data;
}

function buildEntryQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};
	if(opts.limit){
		query.limit = opts.limit;
	}
	if(opts.offset){
		query.offset = opts.offset;
	}

	if(opts.include?.students){
		query.include.push({
			model: db.entryStudent,
			as: 'entry_students',
			required: false,
			include: [{
				...studentInclude(opts.include.students),
				as: 'student_student',
			}],
		});
	}
	return query;
}

export function entryInclude(opts = {}) {
	return {
		model: db.entry,
		as: 'entries',
		...buildEntryQuery(opts),
	};
}

async function getEntry(entryId, opts = {}) {
	const query = buildEntryQuery(opts);
	if (entryId) {
		query.where.id = entryId;
	}
	const entry = await db.entry.findOne(query,{raw: true});
	return entryMapper(entry);
}

async function createEntry(entry = {}) {
	const dbRow = await db.entry.create(entry);
	await saveSettings({
		model: db.entrySetting,
		settings: entry.settings,
		ownerKey: 'entry',
		ownerId: dbRow.id,
	});

	return dbRow.id;
}

export default {
	getEntry,
	createEntry,
};
