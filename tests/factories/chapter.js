import db from '../../api/data/db.js';

const data = async (props = {}) => {

	return {
		...props,
	};
};

export default async function chapterFactory(props = {}) {
	const chapterData = await data(props);

	return db.chapter.create(chapterData);
}
