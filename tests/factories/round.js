import roundRepo from '../../api/repos/roundRepo.js';

export function createRoundData(overrides = {}) {
	return {
		published: true,
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = createRoundData(overrides);
	const roundId = await roundRepo.createRound(data);

	return {
		roundId,
		getRound: () => roundRepo.getRound(roundId, { settings: true }),
	};
}

export default {
	createRoundData,
	create,
};
