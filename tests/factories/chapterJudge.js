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

export async function create(overrides = {}) {
	const data = buildChapterJudgeData(overrides);

	if (!data.chapter) {
		({ chapterId: data.chapter } = await factories.chapter.create());
	}

	const row = await db.chapterJudge.create(data);
	return {
		chapterJudgeId: row.id,
		getChapterJudge: () => db.chapterJudge.findByPk(row.id),
	};
}

export default {
	create,
	buildChapterJudgeData,
};
