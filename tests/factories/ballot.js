import ballotRepo from '../../api/repos/ballotRepo.js';
import factories from './index.js';

export function buildBallotData(overrides = {}) {
	return {
		speakerorder: 0,
		chair: 0,
		...overrides,
	};
}

export async function create(overrides = {}) {
	let sectionId = overrides.section;
	let getSection = null;

	if (!sectionId) {
		const section = await factories.section.create();
		sectionId = section.sectionId;
		getSection = section.getSection;
	}

	const data = buildBallotData({
		...overrides,
		section: sectionId,
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
	create,
};
