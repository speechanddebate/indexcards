import db from '../../api/data/db.js';
import chapterFactory from './chapter.js';
import tournFactory from './tourn.js';

const data = async (props = {}) => {
	const tourn =
    props.tourn ??
    (await tournFactory()).id;

	const chapter =
	props.chapter ??
	(await chapterFactory()).id;

	return {
		tourn,
		chapter,
		...props,
	};
};

export default async function schoolFactory(props = {}) {
	const schoolData = await data(props);

	return db.school.create(schoolData);
}
