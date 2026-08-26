import resultSetRepo from './resultSetRepo.js';

describe('getResultSets', () => {
	it('returns published resultSets when given a valid tournId', async () => {
		//seeded tourn with resultSets
		const tournId = 29807;

		//Act
		var resultSets = await resultSetRepo.getResultSets({tournId});

		Object.entries(resultSets).forEach(([i, resultSet]) => {
			assert.strictEqual(resultSet.Event, undefined, `Result Set at index ${i} (id=${resultSet.id}) should not have event data`);
		});
	});
});
