import { faker } from '@faker-js/faker';
import webpageRepo from '../../api/repos/webpageRepo.js';

export function createWebpageData(overrides = {}) {
	return {
		title: faker.lorem.sentence().slice(0, 63),
		content: faker.lorem.paragraphs(),
		sidebar: faker.lorem.paragraph(),
		slug: faker.lorem.slug(),
		published: true,
		...overrides,
	};
}

export async function createTestWebpage(overrides = {}) {
	const data = createWebpageData(overrides);

	const webpageId = await webpageRepo.createWebpage(data);

	return {
		webpageId,
		getWebpage: () => webpageRepo.getWebpage(webpageId),
	};
}

export default {
	createWebpageData,
	createTestWebpage,
};
