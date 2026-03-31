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
	});
});