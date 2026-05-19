import { faker } from '@faker-js/faker';
import studentRepo from '../../api/repos/studentRepo.js';
import factories from './index.js';

export function buildStudentData(overrides = {}) {
	return {
		first: faker.person.firstName(),
		middle: faker.datatype.boolean() ? faker.person.middleName() : null,
		last: faker.person.lastName(),
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

export async function createTestUnlinkedStudent(overrides = {}) {
	const chapterId = overrides.chapterId || overrides.chapter || (await factories.chapter.createTestChapter()).chapterId;
	const studentDefaults = {
		chapterId,
		personId: null,
		personRequestId: null,
		gradYear: new Date().getFullYear() + 1,
	};

	return createTestStudent({
		...studentDefaults,
		...overrides,
		chapterId: overrides.chapterId || overrides.chapter || chapterId,
	});
}

export default {
	buildStudentData,
	createTestStudent,
	createTestUnlinkedStudent,
};
