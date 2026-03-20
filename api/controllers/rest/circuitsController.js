import circuitRepo from '../../repos/circuitRepo.js';
import { schoolYearDateRange } from '../../helpers/dateTime.js';
import { NotFound } from '../../helpers/problem.js';
import { toPublicCircuit } from '../mappers/circuitMapper.js';

export async function getCircuit(req, res) {
	const circuit = await circuitRepo.getCircuit(req.params.circuitId, {
		active: true,
	});
	if (!circuit) {
		return NotFound(req, res, 'No such circuit found');
	}
	return res.json(toPublicCircuit(circuit));
}

export async function activeCircuits(req, res) {
	const { state, country } = req.query;
	const { start, end } = schoolYearDateRange();
	const circuits = await circuitRepo.getActiveCircuits({ startDate: start, endDate: end, state, country });

	return res.json(circuits.map(toPublicCircuit));
}