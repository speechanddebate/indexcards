
import circuitRepo from '../../repos/circuitRepo';
import { createContext } from '../../../tests/httpMocks.ts';
import * as c from './circuitsController.js';

describe('getCircuit', () => {
	it('returns 404 if the circuit does not exist', async () => {
		vi.spyOn(circuitRepo, 'getCircuit').mockResolvedValue(null);
		const { req, res } = createContext({
			params: { circuitId: 'nonexistent' },
		});

		await c.getCircuit(req, res);

		expect(res).toBeProblemResponse(404);
	});

});