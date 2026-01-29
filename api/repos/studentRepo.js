import db from '../data/db.js';
import { FIELD_MAP } from './mappers/studentMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildStudentQuery(opts = {}){
	const query  = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields,FIELD_MAP),
		include: [],
	};
	return query;
}

export function studentInclude(opts = {}){
	return {
		model: db.student,
		as: 'students',
		...buildStudentQuery(opts),
	};
}