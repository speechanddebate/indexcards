import { faker } from '@faker-js/faker';
import studentRepo from '../../api/repos/studentRepo.js';

export function buildStudentData(overrides = {}) {
	return {
		firstName: faker.person.firstName(),
		middleName: faker.datatype.boolean() ? faker.person.middleName() : null,
		lastName: faker.person.lastName(),
		...overrides,
	};
}

export async function createTestStudent(overrides = {}) {
	const data = buildStudentData(overrides);

	const studentId = await studentRepo.createStudent(data);

	return {
		studentId,
		getStudent: () => studentRepo.getStudent(studentId),
	};
}

export default {
	createTestStudent,
};
