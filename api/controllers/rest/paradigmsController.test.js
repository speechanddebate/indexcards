import personRepo from '../../repos/personRepo.js';
import factories from '../../../tests/factories/index.js';
import { createContext } from '../../../tests/httpMocks.ts';
import paradigmsController from './paradigmsController';
import * as judgeRecordsService from '../../services/results/judgeRecords.js';
import { JudgeRecord } from '../../routes/openapi/schemas/Judge.js';
import { ParadigmDetails } from '../../routes/openapi/schemas/Person.js';
afterEach(() => {
	vi.restoreAllMocks();
});

describe('paradigmsController', () => {
	describe('getParadigms', async () => {
		it('should return a list of paradigms', async () => {
			vi.spyOn(personRepo, 'personSearch').mockResolvedValue([{ id: 1, name: 'Test Paradigm' }]);
			const { req, res } = createContext({
				req: {
					valid: {query: {}},
				},
			});
			await paradigmsController.getParadigms(req, res);
			expect(res).not.toBeProblemResponse();
		});
		it('does not return schools older than 5 years', async () => {
			const fiveYearsAgo = new Date();
			fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
			vi.spyOn(personRepo, 'personSearch').mockResolvedValue([{
				id: 1,
				name: 'Test Paradigm',
				Judges: [
					{ createdAt: new Date(fiveYearsAgo.getTime() - 100), School: { id: 1, name: 'gt5Years' } },
					{ createdAt: new Date(fiveYearsAgo.getTime() + 100), School: { id: 2, name: 'lt5Years' } },
				],
			}]);
			const { req, res } = createContext({
				req: {
					valid: {query: {}},
				},
			});
			await paradigmsController.getParadigms(req, res);
			expect(res).not.toBeProblemResponse();
			const paradigm = res.body.find(p => p.id === 1);
			expect(paradigm).toBeDefined();
			expect(paradigm.schools).toHaveLength(1);
			expect(paradigm.schools[0].name).toBe('lt5Years');

		});
	});
	describe('getParadigmByPersonId', async () => {
		it('should return paradigms for a given personId', async () => {
			vi.spyOn(personRepo, 'getPerson').mockResolvedValue({
				id: 1,
				firstName: 'Mark',
				settings: {
					paradigm: 'test',
				},
				settingsTimestamps:{},
				PersonQuizzes: [await factories.person.createPersonQuiz()],
			});
			const { req, res } = createContext({
				req: {
					valid: {params: { personId: 1 }},
				},
			});
			await paradigmsController.getParadigmByPersonId(req, res);
			expect(res).not.toBeProblemResponse();
			expect(res.body).toMatchSchema(ParadigmDetails);
		});
		it('should return a 404 if personId does not exist', async () => {
			vi.spyOn(personRepo, 'getPerson').mockResolvedValue(null);
			const { req, res } = createContext({
				req: {
					valid: {params: { personId: 999 }},
				},
			});
			await paradigmsController.getParadigmByPersonId(req, res);
			expect(res).toBeProblemResponse(404);
		});

	});

	describe('getJudgingRecord', () => {
		it('maps results to JudgeRecord schema fields', async () => {
			vi.spyOn(judgeRecordsService, 'judgeRecord').mockResolvedValue([
				{
					tournName: null, //handle empty field
					roundDate: '2026-04-01T00:00:00.000Z',
					roundLabel: 'R1',
					eventAbbr: 'PF',
					affTeam: 'AFF1',
					affLabel: 'Aff',
					negTeam: 'NEG1',
					negLabel: 'Neg',
					vote: 'Aff',
					panelVote: 'Aff',
					record: '1-0',
					extraField: 'ignored',
				},
			]);

			const { req, res } = createContext({
				req: {
					valid: {
						params: { personId: 1 },
					},
				},
			});

			await paradigmsController.getJudgingRecord(req, res);

			// Validate each element in the response array
			for (const item of res.body) {
				expect(item).toMatchSchema(JudgeRecord);
			}
		});
	});
});