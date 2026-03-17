import db from '../../api/data/db.js';
import { faker } from '@faker-js/faker';

export function createAdData(overrides = {}) {
	return {
		filename: faker.system.commonFileName('jpg'),
		url: faker.internet.url(),
		start: faker.date.past(),
		end: faker.date.future(),
		background: faker.color.rgb(),
		person: 1,
		approved_by: 1,
		approved: 1,
		...overrides,
	};
}

export async function createTestAd(overrides = {}) {
	const data = createAdData(overrides);
	const adId = await db.ad.create(data);

	return {
		adId,
		getAd: () => db.ad.findByPk(adId),
	};
}
export default {
	createAdData,
	createTestAd,
};