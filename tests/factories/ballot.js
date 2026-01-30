import ballotRepo from '../../api/repos/ballotRepo.js';
import { createTestSection } from './section.js';

export function buildBallotData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function createTestBallot(overrides = {}) {
	let sectionId = overrides.sectionId;
	let getSection = null;

	if (!sectionId) {
		const section = await createTestSection();
		sectionId = section.sectionId;
		getSection = section.getSection;
	}

	const data = buildBallotData({
		...overrides,
		sectionId,
	});

	const ballotId = await ballotRepo.createBallot(data);

	return {
		ballotId,
		sectionId,
		getBallot: () => ballotRepo.getBallot(ballotId),
		getSection,
	};
}

export default {
	createTestBallot,
};
