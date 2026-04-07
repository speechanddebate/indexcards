import factories from '../../../tests/factories';
import { judgeRecord } from './judgeRecords';
import db from '../../data/db.js';
describe('Judge Record Service', async () => {
	let personId,judgeId, tournId, roundId, sectionId, eventId;
	let entryId;
	beforeAll(async () => {
		({ personId } = await factories.person.createTestPerson());
		({ judgeId } = await factories.judge.createTestJudge({ personId }));
		({ tournId } = await factories.tourn.createTestTourn({ hidden: 0 })); //public tourn
		({ eventId } = await factories.event.createTestEvent({ tournId }));
		({ roundId } = await factories.round.createTestRound({
			eventId,
			published: true,
			postPrimary: 3,
		})); //published round with public primary results
		({ sectionId } = await factories.section.createTestSection({ roundId }));
		const entry = await db.entry.create({
			event: eventId,
			tourn: tournId,
			code: 'AFF1',
		});
		entryId = entry.id;
	});
	it('returns the public judging record of a person', async () => {
		const { ballotId } = await factories.ballot.createTestBallot({
			sectionId,
			judgeId,
			entryId,
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