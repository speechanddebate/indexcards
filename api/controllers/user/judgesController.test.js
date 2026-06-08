import con from './judgesController.js';
import judgeRepo from '../../repos/judgeRepo.js';
import chapterJudgeRepo from '../../repos/chapterJudgeRepo.js';
import tabroomRepo from '../../repos/tabroomRepo.js';
import chapterRepo from '../../repos/chapterRepo.js';
import personRepo from '../../repos/personRepo.js';
import changeLogRepo from '../../repos/changeLogRepo.js';
import { UnlinkedJudge } from '../../routes/openapi/schemas/index.ts';
import { createContext } from '../../../tests/httpMocks.ts';
import { notify } from '../../helpers/blast.js';
import logger from '../../helpers/logger.js';
import z from 'zod';

vi.mock('../../repos/judgeRepo.js');
vi.mock('../../repos/chapterJudgeRepo.js');
vi.mock('../../repos/chapterRepo.js');
vi.mock('../../repos/personRepo.js');
vi.mock('../../repos/changeLogRepo.js');
vi.mock('../../repos/tabroomRepo.js');
vi.mock('../../helpers/blast.js');

vi.spyOn(logger, ['debug']).mockImplementation(() => {});

describe('judgesController', () => {
	beforeAll(() => {
		changeLogRepo.createChangeLog.mockResolvedValue(1);
	});
	beforeEach(() => {
		vi.clearAllMocks();
	});
	describe('linkRequests', () => {
		it('should return linked judges and chapter judges for the user', async () => {
			// Mock data
			const mockJudges = [
				{ id: 1, first: 'John', last: 'Doe' },
				{ id: 2, first: 'Jane', last: 'Smith' },
			];
			const mockChapterJudges = [
				{ id: 3, first: 'Alice', last: 'Johnson' },
			];

			judgeRepo.getJudges.mockResolvedValue(mockJudges);
			chapterJudgeRepo.getChapterJudges.mockResolvedValue(mockChapterJudges);

			// Mock request and response
			const {req, res } = createContext({ actor: { id: 123 } });

			// Call the controller function
			await con.linkRequests(req, res);

			// Assertions
			expect(res).not.toBeProblemResponse();
			expect(judgeRepo.getJudges).toHaveBeenCalledWith({ where: { person_request: 123 } });
			expect(chapterJudgeRepo.getChapterJudges).toHaveBeenCalledWith({ where: { person_request: 123 } });
			expect(res.body).toMatchSchema(z.array(UnlinkedJudge));
		});
	});
	describe('claimRequest', () => {
		it('should return 400 if both judgeId and chapterJudgeId are provided', async () => {
			const { req, res } = createContext({ actor: { id: 123 }, valid: { query: { judgeId: 1, chapterJudgeId: 2 } } });
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
		});
		it('should return 400 if neither judgeId nor chapterJudgeId are provided', async () => {
			const { req, res } = createContext({ actor: { id: 123 }, valid: { query: {} } });
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
		});
		it('should return 400 if judgeId is invalid', async () => {
			const { req, res } = createContext({ actor: { id: 123 }, valid: { query: { judgeId: 1 } } });
			// judge not found
			judgeRepo.getJudge.mockResolvedValue(null);
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
			// judge has no category
			judgeRepo.getJudge.mockResolvedValue({ id: 1, category: null });
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
		});
		it('should return 400 if user is already linked to another judge in the same category', async () => {
			const { req, res } = createContext({ actor: { id: 123 }, valid: { query: { judgeId: 1 } } });
			judgeRepo.getJudge.mockResolvedValue({ id: 1, category: 123 });
			judgeRepo.getJudges.mockResolvedValue([{ id: 2, category: 123, person: 123 }]);
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
			judgeRepo.getJudges.mockResolvedValue([{ id: 2, category: 123, person_request: 123 }]);
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
		});
		it('should return 200 and update judge if valid judgeId is provided', async () => {
			const { req, res } = createContext({ actor: { id: 123 }, valid: { query: { judgeId: 1 } } });
			judgeRepo.getJudge.mockResolvedValue({ id: 1, category: 123 });
			judgeRepo.getJudges.mockResolvedValue([]);
			await con.claimRequest(req, res);
			expect(res).not.toBeProblemResponse();
			expect(res.status).toBeCalledWith(200);
			expect(judgeRepo.updateJudge).toHaveBeenCalledWith(1, { person_request: 123 });
		});
		it('should return 400 if chapterJudgeId is invalid', async () => {
			const { req, res } = createContext({ actor: { id: 123 }, valid: { query: { chapterJudgeId: 1 } } });
			// chapter judge not found
			chapterJudgeRepo.getChapterJudge.mockResolvedValue(null);
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
			// chapter judge has no chapter
			chapterJudgeRepo.getChapterJudge.mockResolvedValue({ id: 1, chapter: null });
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
		});
		it('should return 400 if user is already linked to another chapter judge in the same chapter', async () => {
			const { req, res } = createContext({ actor: { id: 123 }, valid: { query: { chapterJudgeId: 1 } } });
			chapterJudgeRepo.getChapterJudge.mockResolvedValue({ id: 1, chapter: 123 });
			chapterJudgeRepo.getChapterJudges.mockResolvedValue([{ id: 2, chapter: 123, person: 123 }]);
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
			chapterJudgeRepo.getChapterJudges.mockResolvedValue([{ id: 2, chapter: 123, person_request: 123 }]);
			await con.claimRequest(req, res);
			expect(res).toBeProblemResponse(400);
		});
		it('should return 200 and update chapter judge if valid chapterJudgeId is provided', async () => {
			const { req, res } = createContext({ actor: { id: 123 }, valid: { query: { chapterJudgeId: 1 } } });
			chapterJudgeRepo.getChapterJudge.mockResolvedValue({ id: 1, chapter: 123 });
			chapterJudgeRepo.getChapterJudges.mockResolvedValue([]);
			chapterRepo.getAdmins.mockResolvedValue([]);
			await con.claimRequest(req, res);
			expect(res).not.toBeProblemResponse();
			expect(res.status).toBeCalledWith(200);
			expect(chapterJudgeRepo.updateChapterJudge).toHaveBeenCalledWith(1, { person_request: 123 });
		});
		it('should send notification email to chapter admins when a chapter judge is claimed', async () => {
			const { req, res } = createContext({ actor: { id: 123, Person: { first: 'Test', last: 'User' } }, valid: { query: { chapterJudgeId: 1 } } });
			chapterJudgeRepo.getChapterJudge.mockResolvedValue({ id: 1, chapter: 123 });
			chapterJudgeRepo.getChapterJudges.mockResolvedValue([]);
			chapterRepo.getAdmins.mockResolvedValue([{ id: 1, email: 'admin@example.com' }]);
			await con.claimRequest(req, res);
			expect(notify).toHaveBeenCalledWith(expect.objectContaining({ ids: [1] }));
		});
	});
	describe('updateParadigm', () => {
		let { req, res } = {};
		beforeEach(() => {
			({ req, res } = createContext({ actor: { Person: { id: 123 } }, session: { id: 'abc' }, ip: 'ip' }));
			tabroomRepo.getSettings.mockResolvedValue([{ tag: 'paradigm_word_limit', value: '100' }]);
			personRepo.getPerson.mockResolvedValue({ id: 123, settings: {} });
		});
		it('should return 400 if paradigm exceeds word limit', async () => {
			req.valid = { body: { paradigm: 'word '.repeat(101) } };
			await con.updateParadigm(req, res);
			expect(res).toBeProblemResponse(400);
		});
		it('should return 403 if persons email is unconfirmed', async () => {
			req.valid = { body: { paradigm: 'word '.repeat(50) } };
			personRepo.getPerson.mockResolvedValue({ id: 123, settings: { email_unconfirmed: true } });
			await con.updateParadigm(req, res);
			expect(res).toBeProblemResponse(403);
		});
		it('does not fail if no word limit is set', async () => {
			req.valid = { body: { paradigm: 'word '.repeat(200) } };
			tabroomRepo.getSettings.mockResolvedValue([]);
			await con.updateParadigm(req, res);
			expect(res).not.toBeProblemResponse();
			expect(logger.debug).toHaveBeenCalled();
		});
		it('should return 400 if paradigm contains profanity', async () => {
			req.valid = { body: { paradigm: 'word '.repeat(50) + ' shit' } };
			await con.updateParadigm(req, res);
			expect(res).toBeProblemResponse(400);
		});
		it('saves the paradigm if it meets all requirements', async () => {
			req.valid = { body: { paradigm: 'word '.repeat(50) } };
			await con.updateParadigm(req, res);
			expect(res.status).toHaveBeenCalledWith(204);
			expect(res).not.toBeProblemResponse();
			expect(changeLogRepo.createChangeLog).toHaveBeenCalled();
			expect(personRepo.savePersonSettings).toHaveBeenCalledWith(123, { paradigm: 'word '.repeat(50) });
		});
	});
});