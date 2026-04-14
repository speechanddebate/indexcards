import scoreRepo from '../../api/repos/scoreRepo.js';
import { createTestBallot } from './ballot.js';

export function buildScoreData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function createTestScore(overrides = {}) {
	let ballot = overrides.ballot;
	let getBallot = null;

	if (!ballot) {
		const Ballot = await createTestBallot(overrides);
		ballot = Ballot.ballotId;
		getBallot = Ballot.getBallot;
	}

	const data = buildScoreData({
		tag: 'winloss',
		value: 1,
		...overrides,
		ballotId: ballot,
	});

	const scoreId = await scoreRepo.createScore(data);

	return {
		scoreId,
		ballotId: ballot,
		getScore: () => scoreRepo.getScore(scoreId),
		getBallot,
	};
}

export default {
	buildScoreData,
	createTestScore,
};

