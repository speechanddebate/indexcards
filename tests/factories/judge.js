import judgeRepo from '../../api/repos/judgeRepo.js';
import factories from './index.js';

export function buildJudgeData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function createTestJudge(overrides = {}) {
	const data = buildJudgeData(overrides);
	if (!overrides.personId){
		({ personId: data.personId } = await factories.person.createTestPerson());
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