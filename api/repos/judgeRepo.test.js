import judgeRepo, { judgeInclude } from './judgeRepo.js';
import factories from '../../tests/factories/index.js';
import db from '../data/db.js';

describe('judgeRepo', () => {
	describe('buildJudgeQuery', () => {
		it('does not include associations by default', async () => {
			const { judgeId } = await factories.judge.createTestJudge();

			const judge = await judgeRepo.getJudge(judgeId);

			expect(judge).toBeDefined();
			expect(judge.Category).toBeUndefined();
			expect(judge.School).toBeUndefined();
			expect(judge.Ballots).toBeUndefined();
		});

		it('includes Category when requested', async () => {
			const { categoryId } = await factories.category.createTestCategory();
			const { judgeId } = await factories.judge.createTestJudge({ categoryId });

			const judge = await judgeRepo.getJudge(judgeId, { include: { Category: true } });

			expect(judge).toBeDefined();
			expect(judge.Category).toBeDefined();
			expect(judge.Category.id).toBe(categoryId);
		});

		it('includes School when requested', async () => {
			const { schoolId } = await factories.school.createTestSchool();
			const { judgeId } = await factories.judge.createTestJudge({ schoolId });

			const judge = await judgeRepo.getJudge(judgeId, { include: { School: true } });

			expect(judge).toBeDefined();
			expect(judge.School).toBeDefined();
			expect(judge.School.id).toBe(schoolId);
		});

		it('includes Ballots when requested', async () => {
			const { judgeId } = await factories.judge.createTestJudge();
			await factories.ballot.createTestBallot({ judgeId });

			const judge = await judgeRepo.getJudge(judgeId, { include: { Ballots: true } });

			expect(judge).toBeDefined();
			expect(judge.Ballots).toBeDefined();
			expect(Array.isArray(judge.Ballots)).toBe(true);
			expect(judge.Ballots.length).toBeGreaterThan(0);
		});

		it('includes settings when requested', async () => {
			const { judgeId } = await factories.judge.createTestJudge();

			await db.judgeSetting.create({
				judge: judgeId,
				tag: 'exampleSetting',
				value: 'exampleValue',
			});

			const judge = await judgeRepo.getJudge(judgeId, { settings: true });

			expect(judge).toBeDefined();
			expect(judge.settings).toBeDefined();
			expect(judge.settings.exampleSetting).toBe('exampleValue');
		});
	});

	describe('judgeInclude', () => {
		it('returns base judge include config', () => {
			const inc = judgeInclude();
			expect(inc.model).toBeDefined();
			expect(Array.isArray(inc.include)).toBe(true);
		});
	});

	describe('getJudge', () => {
		it('returns the judge when the id is valid', async () => {
			const { judgeId } = await factories.judge.createTestJudge();

			const result = await judgeRepo.getJudge(judgeId);

			expect(result).not.toBeNull();
			expect(result.id).toBe(judgeId);
		});

		it('returns null when the id is invalid', async () => {
			const result = await judgeRepo.getJudge(999999);
			expect(result).toBeNull();
		});
	});

	describe('createJudge', () => {
		it('creates a judge and returns the new id', async () => {
			const { personId } = await factories.person.createTestPerson();
			const newJudgeId = await judgeRepo.createJudge({
				personId,
			});

			expect(newJudgeId).toBeDefined();

			const judge = await judgeRepo.getJudge(newJudgeId);
			expect(judge).not.toBeNull();
			expect(judge.id).toBe(newJudgeId);
		});
	});
});
