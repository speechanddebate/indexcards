import db from '../../api/data/db.js';

const data = (props = {}) => {
	const defaultProps = {
	};

	return Object.assign({}, defaultProps, props);
};

export default async function tournFactory(props = {}) {
	const tournData = data(props);

	return db.tourn.create(tournData);
}
