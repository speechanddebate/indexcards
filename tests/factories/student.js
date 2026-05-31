import { faker } from '@faker-js/faker';
import studentRepo from '../../api/repos/studentRepo.js';

export function buildStudentData(overrides = {}) {
	return {
		first: faker.person.firstName(),
		middle: faker.datatype.boolean() ? faker.person.middleName() : null,
		last: faker.person.lastName(),
		grad_year: new Date().getFullYear() + 3,
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = buildStudentData(overrides);

	const studentId = await studentRepo.createStudent(data);

	return {
		studentId,
		getStudent: () => studentRepo.getStudent(studentId),
	};
}

export default {
	buildStudentData,
	create,
};
