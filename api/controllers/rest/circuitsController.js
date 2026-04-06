import circuitRepo from '../../repos/circuitRepo.js';
import { schoolYearDateRange } from '../../helpers/dateTime.js';
import { NotFound, UnexpectedError } from '../../helpers/problem.js';
import { toPublicCircuit } from '../mappers/circuitMapper.js';
import { restCircuit } from '../../routes/openapi/schemas/Circuit.js';

export async function getCircuit(req, res) {
	const circuit = await circuitRepo.getCircuit(req.params.circuitId, {
		active: true,
	});
	if (!circuit) return NotFound(req, res, 'No such circuit found');
	try {
		return res.json(
			restCircuit.parse({
				...circuit,
				state: circuit.state ? circuit.state : null,
			})
		);
	} catch (error) {
		return UnexpectedError(req, res, error.message);
	}
}

export async function activeCircuits(req, res) {
	const { state, country, limit, offset } = req.valid.query;
	const { start, end } = schoolYearDateRange();
	const circuits = await circuitRepo.getActiveCircuits({
		startDate: start,
		endDate: end,
		state,
		country,
		limit,
		offset,
	});

	return res.json(circuits.map(toPublicCircuit));
}