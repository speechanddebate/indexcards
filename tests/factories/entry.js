import entryRepo from '../../api/repos/entryRepo.js';

function buildEntryData(overrides = {}) {
	return {
		...overrides,
	};
}

export async function createTestEntry(overrides = {}) {
	const data = buildEntryData(overrides);
	const entryId = await entryRepo.createEntry(data);

	return {
		entryId,
		getEntry: () => entryRepo.getEntry(entryId),
	};
}
export default {
	buildEntryData,
	createTestEntry,
};