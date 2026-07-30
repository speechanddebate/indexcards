import factories from '../../../tests/factories/index.js';
import { judgeRecord } from './judgeRecords';
import db from '../../data/db.js';
describe('Judge Record Service', async () => {
	let personId,judgeId, tournId, roundId, sectionId, eventId;
	let entryId;
	beforeAll(async () => {
		({ personId } = await factories.person.create());
		({ judgeId } = await factories.judge.createTestJudge({ person: personId }));
		({ tournId } = await factories.tourn.createTestTourn({ hidden: 0 })); //public tourn
		({ eventId } = await factories.event.create({ tournId }));
		({ roundId } = await factories.round.create({
			event: eventId,
			published: true,
			post_primary: 3,
		})); //published round with public primary results
		({ sectionId } = await factories.section.create({ round: roundId }));
		const entry = await db.entry.create({
			event: eventId,
			tourn: tournId,
			code: 'AFF1',
		});
		entryId = entry.id;
	});
	it('returns the public judging record of a person', async () => {
		const { ballotId } = await factories.ballot.create({
			section: sectionId,
			judge: judgeId,
			entry: entryId,
			side: 1,
		});
		const { scoreId } = await factories.score.createTestScore({
			ballot: ballotId,
			tag: 'winloss',
			value: 1,
		});
		const res = await judgeRecord(personId);

		expect(scoreId).toBeDefined();
		expect(Array.isArray(res)).toBe(true);
		expect(res.length).toBeGreaterThan(0);
		expect(res[0].affTeam).toBe('AFF1');
	});
});