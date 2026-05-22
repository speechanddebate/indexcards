import judgeRepo from '../../api/repos/judgeRepo.js';
import { faker } from '@faker-js/faker';
import factories from './index.js';

export function buildJudgeData(overrides = {}) {
	return {
		first: faker.person.firstName(),
		last: faker.person.lastName(),
		...overrides,
	};
}

export async function createTestJudge(overrides = {}) {
	const data = buildJudgeData(overrides);
	if (!data.person){
		({ personId: data.person } = await factories.person.createTestPerson());
	}
	const judgeId = await judgeRepo.createJudge(data);
	return {
		judgeId,
		getJudge: () => judgeRepo.getJudge(judgeId, { settings: true }),
	};
}
export default {
	createTestJudge,
};