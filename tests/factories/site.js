import siteRepo from '../../api/repos/siteRepo.js';
import tournRepo from '../../api/repos/tournRepo.js';
import { fakeSchoolName } from './factoryUtils.js';

export function createSiteData(overrides = {}) {
	return {
		name: fakeSchoolName(),
		...overrides,
	};
}

export async function createTestSite(overrides = {}) {
	const data = createSiteData(overrides);

	const siteId = await siteRepo.createSite(data);

	if (overrides.tournId) {
		await tournRepo.addSite(overrides.tournId, siteId);
	}

	return {
		siteId,
		getSite: () => siteRepo.getSite(siteId),
	};
}
export default {
	createSiteData,
	createTestSite,
};
