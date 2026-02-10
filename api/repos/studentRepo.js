import db from '../data/db.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/studentMapper.js';
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

async function getStudent(id, opts = {}) {
	const student = await db.student.findByPk(id, buildStudentQuery(opts));
	return toDomain(student);
}

async function createStudent(data) {
	const student = await db.student.create(toPersistence(data));
	return student.id;
}

export default {
	getStudent,
	createStudent,
};