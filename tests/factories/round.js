import roundRepo from '../../api/repos/roundRepo.js';

export function buildRoundData(overrides = {}) {
	return {
		published: true,
		...overrides,
	};
}

export async function createTestRound(overrides = {}) {
	const data = buildRoundData(overrides);
	const roundId = await roundRepo.createRound(data);

	return {
		roundId,
		getRound: () => roundRepo.getRound(roundId, { settings: true }),
	};
}
