import resultSetRepo from './resultSetRepo.js';

describe('getResultSets', () => {
	it('returns published resultSets when given a valid tournId', async () => {
		//seeded tourn with resultSets
		const tournId = 29807;

		//Act
		var resultSets = await resultSetRepo.getResultSets({tournId});

		resultSets.forEach((resultSet, i) => {
			assert.equal(resultSet.published, 1, `Result Set at index ${i} (resultSetId=${resultSet.resultSetId}) is not published`);
			assert.strictEqual(resultSet.Event, undefined, `Result Set at index ${i} (id=${resultSet.id}) should not have event data`);
		});
	});

	it('returns event info when include.event is true', async () => {
		//seeded tourn with resultSets
		const tournId = 29807;

		//Act
		var resultSets = await resultSetRepo.getResultSets({tournId},{
			include: {
				Event: true,
			},
		});

		resultSets.forEach((resultSet, i) => {
			assert.equal(resultSet.published, 1, `Result Set at index ${i} (resultSetId=${resultSet.resultSetId}) is not published`);
			assert.ok(resultSet.Event, `Result Set at index ${i} (id=${resultSet.id}) is missing an event`);
			assert.typeOf(resultSet.Event.id, 'number', `Result Set at index ${i} (id=${resultSet.id}) has no event.id`);
		});
	});

	it('returns only requested event fields and settings when includeEvent is object', async () => {

		const tournId = 29807;

		const resultSets = await resultSetRepo.getResultSets({ tournId },{
			include: {
				Event: {
					fields   : ['id', 'name', 'abbr', 'level'], // exclude 'type'
					settings : ['max_entry'],
				},
			},
		});

		resultSets.forEach((resultSet, i) => {
			// Result Set itself
			assert.equal(resultSet.published, 1, `Result Set at index ${i} (id=${resultSet.id}) is not published`);
			assert.typeOf(resultSet.id, 'number', `Result Set at index ${i} has no id`);

			// Event object
			assert.ok(resultSet.Event, `Result Set at index ${i} (id=${resultSet.id}) is missing an event`);

			// Check requested fields exist
			['id', 'name', 'abbr', 'level'].forEach(field => {
				assert.ok(field in resultSet.Event, `Event field "${field}" missing for resultSet ${resultSet.id}`);
			});

			// Ensure excluded fields are NOT present
			assert.strictEqual(resultSet.Event.type, undefined, `Event field "type" should be undefined for resultSet ${resultSet.id}`);

			// Assert event.settings has at least one property
			if (resultSet.Event.settings) {
				const hasSettings = Object.keys(resultSet.Event.settings).length > 0;
				assert.ok(hasSettings, `Result Set at index ${i} (id=${resultSet.id}) has no event settings`);
			};
		});
	});
});
