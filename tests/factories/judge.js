import judgeRepo from '../../api/repos/judgeRepo.js';
import { faker } from '@faker-js/faker';

export function buildJudgeData(overrides = {}) {
	return {
		first: faker.person.firstName(),
		last: faker.person.lastName(),
		...overrides,
	};
}

export async function createTestJudge(overrides = {}) {
	const data = buildJudgeData(overrides);
	const judgeId = await judgeRepo.createJudge(data);
	return {
		judgeId,
		getJudge: () => judgeRepo.getJudge(judgeId, { settings: true }),
	};
}
export default {
	createTestJudge,
};