import judgesController from './judgesController.js';
import { createReq, createRes } from '../../../tests/httpMocks.ts';

vi.mock('../../repos/judgeRepo.js', () => ({
	default: {
		unlinkedSearch: vi.fn(),
	},
}));
vi.mock('../../repos/chapterJudgeRepo.js', () => ({
	default: {
		unlinkedSearch: vi.fn(),
	},
}));

import judgeRepo from '../../repos/judgeRepo.js';
import chapterJudgeRepo from '../../repos/chapterJudgeRepo.js';

describe('judgesController.unlinkedSearch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('combines judge and chapter_judge results', async () => {
		vi.mocked(judgeRepo.unlinkedSearch).mockResolvedValue([
			{ id: 1, first: 'Alex', middle: null, last: 'Smith', tourn_name: 'State', school_name: 'Central High' },
		]);
		vi.mocked(chapterJudgeRepo.unlinkedSearch).mockResolvedValue([
			{ id: 2, first: 'Alex', middle: null, last: 'Smith', chapter_name: 'Central Chapter', tourn_count: 3 },
		]);

		const req = createReq({
			valid: { query: { first: 'Alex', last: 'Smith' } },
			actor: { id: 99, Person: { first: 'Alex', last: 'Smith' } },
		});
		const res = createRes();

		await judgesController.unlinkedSearch(req, res);

		expect(res.statusCode).toBe(200);
		const body = /** @type {Array<Record<string, unknown>>} */ (res.body);
		expect(body).toHaveLength(2);

		const judge = body.find(r => r.type === 'judge');
		expect(judge).toMatchObject({ id: 1, type: 'judge', first: 'Alex', last: 'Smith', tournName: 'State', schoolName: 'Central High' });

		const cj = body.find(r => r.type === 'chapter_judge');
		expect(cj).toMatchObject({ id: 2, type: 'chapter_judge', first: 'Alex', last: 'Smith', tournCount: 3, schoolName: 'Central Chapter' });
	});

	it('falls back to actor name when query params are missing', async () => {
		vi.mocked(judgeRepo.unlinkedSearch).mockResolvedValue([]);
		vi.mocked(chapterJudgeRepo.unlinkedSearch).mockResolvedValue([]);

		const req = createReq({
			valid: { query: {} },
			actor: { id: 5, Person: { first: 'Jordan', last: 'Lee' } },
		});
		const res = createRes();

		await judgesController.unlinkedSearch(req, res);

		expect(judgeRepo.unlinkedSearch).toHaveBeenCalledWith(
			expect.objectContaining({ first: 'Jordan', last: 'Lee' }),
			expect.any(Object),
		);
		expect(chapterJudgeRepo.unlinkedSearch).toHaveBeenCalledWith(
			expect.objectContaining({ first: 'Jordan', last: 'Lee' }),
			expect.any(Object),
		);
	});
});
