import sectionRepo from '../../api/repos/sectionRepo.js';

export function createSectionData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function create(overrides = {}) {
	const data = createSectionData(overrides);
	const sectionId = await sectionRepo.createSection(data);

	return {
		sectionId,
		getSection: () => sectionRepo.getSection(sectionId, { settings: true }),
	};
}
export default {
	createSectionData,
	create,
};