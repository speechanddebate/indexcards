import db from '../../api/data/db.js';
import schoolFactory from './school.js';
import personFactory from './person.js';

const data = async (props = {}) => {
	const school =
    props.school ??
    (await schoolFactory()).id;

	const person =
    props.person ??
    (await personFactory()).id;

	return {
		school,
		person,
		...props, // allow overrides last
	};
};

export default async function contactFactory(props = {}) {
	return db.contact.create(await data(props));
}
