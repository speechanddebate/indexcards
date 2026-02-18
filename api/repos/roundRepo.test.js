import roundRepo from './roundRepo.js';

describe('getRounds', () => {
	it('returns published rounds when given valid tournId', async () => {
		//seeded tourn with rounds
		const tournId = 29807;

		//Act
		var rounds = await roundRepo.getRounds({tournId});

		rounds.forEach((round, i) => {
			assert.equal(round.published, 1, `Round at index ${i} (roundId=${round.roundId}) is not published`);
			assert.strictEqual(round.event, undefined, `Round at index ${i} (id=${round.id}) should not have event data`);
		});
	});
	it('returns event info when include.event is true', async () => {
		//seeded tourn with rounds
		const tournId = 29807;

		//Act
		var rounds = await roundRepo.getRounds({tournId},{
			include: {
				event: true,
			},
		});

		rounds.forEach((round, i) => {
			assert.equal(round.published, 1, `Round at index ${i} (roundId=${round.roundId}) is not published`);
			assert.ok(round.event, `Round at index ${i} (id=${round.id}) is missing an event`);
			assert.typeOf(round.event.id, 'number', `Round at index ${i} (id=${round.id}) has no event.id`);
		});
	});
	it('returns only requested event fields and settings when includeEvent is object', async () => {
		const tournId = 29807;

		const rounds = await roundRepo.getRounds({ tournId },{
			include: {
				event: {
					fields: ['id', 'name', 'abbr', 'level'], // exclude 'type'
					settings: ['max_entry'],
				},
			},
		});

		rounds.forEach((round, i) => {
			// Round itself
			assert.equal(round.published, 1, `Round at index ${i} (id=${round.id}) is not published`);
			assert.typeOf(round.id, 'number', `Round at index ${i} has no id`);

			// Event object
			assert.ok(round.event, `Round at index ${i} (id=${round.id}) is missing an event`);

			// Check requested fields exist
			['id', 'name', 'abbr', 'level'].forEach(field => {
				assert.ok(field in round.event, `Event field "${field}" missing for round ${round.id}`);
			});

			// Ensure excluded fields are NOT present
			assert.strictEqual(round.event.type, undefined, `Event field "type" should be undefined for round ${round.id}`);

			// Assert event.settings has at least one property
			if (round.event.settings) {
				const hasSettings = Object.keys(round.event.settings).length > 0;
				assert.ok(hasSettings, `Round at index ${i} (id=${round.id}) has no event settings`);
			};
		});
	});
});
