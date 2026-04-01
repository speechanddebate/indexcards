import personRepo from '../../repos/personRepo.js';
import { createContext } from '../../../tests/httpMocks.js';
import paradigmsController from './paradigmsController';

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
});