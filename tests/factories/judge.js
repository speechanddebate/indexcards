import judgeRepo from '../../api/repos/judgeRepo.js';

export function buildJudgeData(overrides = {}) {
	return {
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