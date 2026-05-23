import { faker } from '@faker-js/faker';
import db from '../../api/data/db.js';
import factories from './index.js';

export function buildChapterJudgeData(overrides = {}) {
	return {
		first: faker.person.firstName(),
		last: faker.person.lastName(),
		...overrides,
	};
}

export async function createTestChapterJudge(overrides = {}) {
	const data = buildChapterJudgeData(overrides);

	if (!data.chapter) {
		({ chapterId: data.chapter } = await factories.chapter.createTestChapter());
	}

	const row = await db.chapterJudge.create(data);
	return {
		chapterJudgeId: row.id,
		getChapterJudge: () => db.chapterJudge.findByPk(row.id),
	};
}

export default {
	createTestChapterJudge,
	buildChapterJudgeData,
};
