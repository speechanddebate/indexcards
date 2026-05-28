import db from '../../api/data/db.js';

function createChapterData(overrides = {}) {
	return {
		name: 'Test Chapter',
		...overrides,
	};
}

export async function create(overrides = {}) {
	const chapterData = await createChapterData(overrides);

	const chapter = await db.chapter.create(chapterData);
	const chapterId = chapter.chapterId ?? chapter.id;

	return { chapterId };
}
export default {
	create,
	createChapterData,
};