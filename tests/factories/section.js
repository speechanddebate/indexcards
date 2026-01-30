import sectionRepo from '../../api/repos/sectionRepo.js';

export function buildSectionData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function createTestSection(overrides = {}) {
	const data = buildSectionData(overrides);
	const sectionId = await sectionRepo.createSection(data);

	return {
		sectionId,
		getSection: () => sectionRepo.getSection(sectionId, { settings: true }),
	};
}
export default {
	createTestSection,
};