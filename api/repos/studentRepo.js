import db from '../data/db.js';
import { schoolYearDateRange } from '../helpers/dateTime.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/studentMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildStudentQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};
	if (opts.where) {
		query.where = { ...query.where, ...opts.where };
	}

	return query;
}

export function studentInclude(opts = {}) {
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
async function updateStudent(id, data){
	await db.student.update(toPersistence(data), { where: { id } });
	return getStudent(id);
}
async function getStudents(opts = {}) {
	const query = buildStudentQuery(opts);
	const students = await db.student.findAll(query);
	return students.map(toDomain);
}
/**
  * Search for students that are not linked to a tabroom account.
  */
async function unlinkedSearch(params) {
	if(!params?.first || !params?.last) {
		throw new Error('unlinkedSearch requires first and last parameters');
	}
	const first = params.first;
	const last = params.last;
	const schoolYear = params.schoolYear ?? schoolYearDateRange().start.getFullYear();

	const sql = `
		SELECT
			student.id,
			student.first,
			student.middle,
			student.last,
			student.grad_year,
			chapter.id AS chapter_id,
			chapter.name AS chapter_name,
			chapter.state AS chapter_state,
			chapter.level AS chapter_level,
			COUNT(DISTINCT tourn.id) AS tourn_count
		FROM student
		JOIN chapter ON student.chapter = chapter.id
		LEFT JOIN entry_student es ON es.student = student.id
		LEFT JOIN entry ON es.entry = entry.id
		LEFT JOIN event ON entry.event = event.id
		LEFT JOIN tourn ON event.tourn = tourn.id
		WHERE 1=1
			AND student.first LIKE :first
			AND student.last LIKE :last
			AND (student.person = 0 OR student.person IS NULL)
			AND (student.person_request = 0 OR student.person_request IS NULL)
			AND student.grad_year > :schoolYear
		GROUP BY student.id
	`;

	return db.sequelize.query(sql, {
		replacements: {
			first: `${first}%`,
			last: `${last}%`,
			schoolYear,
		},
		type: db.Sequelize.QueryTypes.SELECT,
	});
}

export default {
	getStudent,
	createStudent,
	updateStudent,
	getStudents,
	unlinkedSearch,
};
