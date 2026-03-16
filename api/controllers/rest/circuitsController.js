import circuitRepo from '../../repos/circuitRepo.js';
import { schoolYearDateRange } from '../../helpers/dateTime.js';

export async function activeCircuits(req, res) {
	const { state, country } = req.query;
	const { start, end } = schoolYearDateRange();
	console.log(`Fetching active circuits from ${start} to ${end} for state: ${state}, country: ${country}`);
	const circuits = await circuitRepo.getActiveCircuits({ startDate: start, endDate: end, state, country });

	return res.json(circuits.map(circuit => ({
		id: circuit.id,
		abbr: circuit.abbr ?? '',
		name: circuit.name ?? '',
		state: circuit.state ?? '',
		country: circuit.country ?? '',
		tournCount: circuit.tourns ?? 0,
	})));
}