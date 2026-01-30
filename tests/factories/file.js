import { faker } from '@faker-js/faker';
import fileRepo from '../../api/repos/fileRepo.js';

export function buildFileData(overrides = {}) {
	return {
		fileName: faker.system.fileName(),
		uploaded: faker.date.past(),
		...overrides,
	};
}

export async function createTestFile(overrides = {}) {
	const data = buildFileData(overrides);
	const fileId = await fileRepo.createFile(data);

	return {
		fileId,
		getFile: () => fileRepo.getFile(fileId),
	};
}
export default {
	createTestFile,
};