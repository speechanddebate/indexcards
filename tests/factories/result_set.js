import db from '../../api/data/db.js';

// Factory to create fake result_set data
export function createResultSetData(overrides = {}) {
	return {
		...overrides,
	};
}

// Factory to create a result_set in the database for tests
export async function createTestResultSet(overrides = {}) {
	const data = createResultSetData(overrides);
	const resultSet = await db.resultSet.create(data);

	return {
		resultSetId: resultSet.id,
		getResultSet: () => db.resultSet.findByPk(resultSet.id),
	};
}

export default {
	createResultSetData,
	createTestResultSet,
};