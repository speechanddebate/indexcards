import circuitRepo from '../../repos/circuitRepo.js';
import * as z from 'zod';
import { schoolYearDateRange } from '../../helpers/dateTime.js';
import { NotFound } from '../../helpers/problem.js';
import { toPublicCircuit } from '../mappers/circuitMapper.js';
import { restCircuit } from '../../routes/openapi/schemas/Circuit.js';

export async function getCircuit(req, res) {
	//can parse params, could have a global handler for zod error that return bad requests on failure
	const circuitId = z.coerce.number().positive().parse(req.params.circuitId);
	const circuit = await circuitRepo.getCircuit(circuitId, {
		active: true,
	});
	if (!circuit) return NotFound(req, res, 'No such circuit found');
	return res.json(
		//will ignore extra fields not in schema and validate the ones present
		restCircuit.parse(circuit)
	);
}

export async function activeCircuits(req, res) {
	const { state, country } = req.query;
	const { start, end } = schoolYearDateRange();
	const circuits = await circuitRepo.getActiveCircuits({ startDate: start, endDate: end, state, country });

	return res.json(circuits.map(toPublicCircuit));
}