export function toPublicCircuit(circuit){
	return {
		id: circuit.id,
		abbr: circuit.abbr ?? '',
		name: circuit.name ?? '',
		state: circuit.state ?? '',
		country: circuit.country ?? '',
		...(typeof circuit.tourns !== 'undefined' ? { tournCount: circuit.tourns } : {}),
	};
}