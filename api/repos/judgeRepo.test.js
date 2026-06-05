import judgeRepo, { judgeInclude } from './judgeRepo';
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
			const { judgeId } = await factories.judge.createTestJudge({ category: categoryId });

			const judge = await judgeRepo.getJudge(judgeId, { include: { Category: true } });

			expect(judge).toBeDefined();
			expect(judge.Category).toBeDefined();
			expect(judge.Category.id).toBe(categoryId);
		});

		it('includes School when requested', async () => {
			const { schoolId } = await factories.school.createTestSchool();
			const { judgeId } = await factories.judge.createTestJudge({ school: schoolId });

			const judge = await judgeRepo.getJudge(judgeId, { include: { School: true } });

			expect(judge).toBeDefined();
			expect(judge.School).toBeDefined();
			expect(judge.School.id).toBe(schoolId);
		});

		it('includes Ballots when requested', async () => {
			const { judgeId } = await factories.judge.createTestJudge();
			await factories.ballot.create({ judgeId });

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
			const { personId } = await factories.person.create();
			const newJudgeId = await judgeRepo.createJudge({ person: personId });

			expect(newJudgeId).toBeDefined();

			const judge = await judgeRepo.getJudge(newJudgeId);
			expect(judge).not.toBeNull();
			expect(judge.id).toBe(newJudgeId);
		});
	});
	describe('unlinkedSearch', () => {
		it('throws when first or last is missing', async () => {
			await expect(judgeRepo.unlinkedSearch({ first: 'Pat' })).rejects.toThrow(
				'unlinkedSearch requires first and last parameters'
			);
		});

		it('returns active unlinked judges with tournament and school names', async () => {
			const { tournId } = await factories.tourn.createTestTourn({name: 'Test Tournament'});
			const { categoryId } = await factories.category.createTestCategory({ tourn: tournId });
			const { schoolId } = await factories.school.createTestSchool({ name: 'Central High' });

			const { judgeId, getJudge } = await factories.judge.createTestJudge({
				category: categoryId,
				school: schoolId,
				person_request: null,
			});
			const Judge = await getJudge();

			const results = await judgeRepo.unlinkedSearch({ first: Judge.first, last: Judge.last });

			expect(results).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						id: judgeId,
						first: Judge.first,
						last: Judge.last,
						school_name: 'Central High',
						tourn_name: 'Test Tournament',
					}),
				])
			);
		});

		it('excludes ended tournaments and rows requested by the excluded person', async () => {
			const requesterId = (await factories.person.create()).personId;
			const otherRequesterId = (await factories.person.create()).personId;
			const now = new Date();

			const { tournId: activeTournId } = await factories.tourn.createTestTourn({
				start: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
				end: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
			});
			const { tournId: endedTournId } = await factories.tourn.createTestTourn({
				start: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
				end: new Date(now.getTime() - 24 * 60 * 60 * 1000),
			});

			const { categoryId: activeCategoryId } = await factories.category.createTestCategory({ tourn: activeTournId });
			const { categoryId: endedCategoryId } = await factories.category.createTestCategory({ tourn: endedTournId });

			const { judgeId: includedJudgeId } = await factories.judge.createTestJudge({
				first: 'Alex',
				last: 'Jordan',
				category: activeCategoryId,
				person_request: otherRequesterId,
			});
			const { judgeId: excludedByRequesterJudgeId } = await factories.judge.createTestJudge({
				first: 'Alex',
				last: 'Jordan',
				category: activeCategoryId,
				person_request: requesterId,
			});
			const { judgeId: excludedByEndedTournJudgeId } = await factories.judge.createTestJudge({
				first: 'Alex',
				last: 'Jordan',
				category: endedCategoryId,
			});

			const results = await judgeRepo.unlinkedSearch(
				{ first: 'Alex', last: 'Jordan' },
				{ notRequestedBy: requesterId }
			);

			const resultIds = results.map(judge => judge.id);
			expect(resultIds).toContain(includedJudgeId);
			expect(resultIds).not.toContain(excludedByRequesterJudgeId);
			expect(resultIds).not.toContain(excludedByEndedTournJudgeId);
		});

	});
	describe('getJudgeHistory', () => {
		it('returns judge history for a person', async () => {
			const { personId } = await factories.person.create();
			const { tournId } = await factories.tourn.createTestTourn(); // start is past by default
			const { categoryId } = await factories.category.createTestCategory({ tourn: tournId });
			const { judgeId } = await factories.judge.createTestJudge({ person: personId, category: categoryId });

			// Create event → round → panel → ballot chain
			const { eventId } = await factories.event.create({ category: categoryId });
			const { roundId } = await factories.round.create({ event: eventId, published: true });
			const { sectionId } = await factories.section.create({ round: roundId });
			await factories.ballot.create({ sectionId, judgeId });
			const history = await judgeRepo.getJudgeHistory(personId, 10, 0);

			expect(history.length).toBeGreaterThan(0);
			expect(history[0].id).toBe(judgeId);
			expect(history[0].Category.id).toBe(categoryId);
		});
	});
});
