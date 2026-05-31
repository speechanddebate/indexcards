import chapterJudgeRepo from './chapterJudgeRepo.js';
import factories from '../../tests/factories/index.js';

describe('chapterJudgeRepo', () => {
	describe('unlinkedSearch', () => {
		it('throws when first or last is missing', async () => {
			await expect(chapterJudgeRepo.unlinkedSearch({ first: 'Pat' })).rejects.toThrow(
				'unlinkedSearch requires first and last parameters'
			);
		});

		it('returns unlinked chapter judges with chapter name and tourn count', async () => {
			const { chapterJudgeId, getChapterJudge } = await factories.chapterJudge.create();
			const cj = await getChapterJudge();

			const { tournId } = await factories.tourn.createTestTourn();
			const { categoryId } = await factories.category.createTestCategory({ tourn: tournId });
			await factories.judge.createTestJudge({ chapter_judge: chapterJudgeId, category: categoryId });

			const results = await chapterJudgeRepo.unlinkedSearch({ first: cj.first, last: cj.last });

			const found = results.find(r => r.id === chapterJudgeId);
			expect(found).toBeDefined();
			expect(found.first).toBe(cj.first);
			expect(found.last).toBe(cj.last);
			expect(found.chapter_name).toBeDefined();
			expect(Number(found.tourn_count)).toBeGreaterThanOrEqual(1);
		});

		it('counts distinct tournaments across multiple judge records', async () => {
			const { chapterJudgeId, getChapterJudge } = await factories.chapterJudge.create();
			const cj = await getChapterJudge();

			const { tournId: tournId1 } = await factories.tourn.createTestTourn();
			const { tournId: tournId2 } = await factories.tourn.createTestTourn();
			const { categoryId: cat1 } = await factories.category.createTestCategory({ tourn: tournId1 });
			const { categoryId: cat2 } = await factories.category.createTestCategory({ tourn: tournId2 });

			await factories.judge.createTestJudge({ chapter_judge: chapterJudgeId, category: cat1 });
			await factories.judge.createTestJudge({ chapter_judge: chapterJudgeId, category: cat2 });

			const results = await chapterJudgeRepo.unlinkedSearch({ first: cj.first, last: cj.last });

			const found = results.find(r => r.id === chapterJudgeId);
			expect(found).toBeDefined();
			expect(Number(found.tourn_count)).toBeGreaterThanOrEqual(2);
		});

		it('excludes rows requested by the excluded person', async () => {
			const requesterId = (await factories.person.create()).personId;
			const otherRequesterId = (await factories.person.create()).personId;

			const { chapterJudgeId: includedId } = await factories.chapterJudge.create({
				first: 'River',
				last: 'Unlinked',
				person_request: otherRequesterId,
			});
			const { chapterJudgeId: excludedId } = await factories.chapterJudge.create({
				first: 'River',
				last: 'Unlinked',
				person_request: requesterId,
			});

			const results = await chapterJudgeRepo.unlinkedSearch(
				{ first: 'River', last: 'Unlinked' },
				{ notRequestedBy: requesterId }
			);

			const resultIds = results.map(r => r.id);
			expect(resultIds).toContain(includedId);
			expect(resultIds).not.toContain(excludedId);
		});

		it('includes chapter judges with no person_request when notRequestedBy is set', async () => {
			const requesterId = (await factories.person.create()).personId;

			const { chapterJudgeId } = await factories.chapterJudge.create({
				first: 'Morgan',
				last: 'Norequest',
				person_request: null,
			});

			const results = await chapterJudgeRepo.unlinkedSearch(
				{ first: 'Morgan', last: 'Norequest' },
				{ notRequestedBy: requesterId }
			);

			expect(results.map(r => r.id)).toContain(chapterJudgeId);
		});
	});
});
