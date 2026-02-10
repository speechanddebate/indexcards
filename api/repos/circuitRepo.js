import db from '../data/db.js';
import { withSettingsInclude, saveSettings } from './utils/settings.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/circuitMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { tournInclude } from './tournRepo.js';

function buildCircuitQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if (opts.include?.tourns) {
		query.include.push({
			model: db.tournCircuit,
			as: 'tourn_circuits', // matches your existing association
			required: false,       // optional, true if you only want circuits that have tourns
			include: [{
				...tournInclude(opts.include.tourns),
				as: 'tourn_tourn',
			}],
		});
	}

	query.include.push(
		...withSettingsInclude({
			model: db.circuitSetting,
			as: 'circuit_settings',
			settings: opts.settings,
		})
	);

	return query;
}

export function circuitInclude(opts = {}) {
	return {
		model: db.circuit,
		as: 'circuits',
		...buildCircuitQuery(opts),
	};
}

async function getCircuits(scope = {}, opts = {}){
	const query = buildCircuitQuery(opts);

	if (scope.tournId) {
		const existingTournCircuitInclude = query.include.find(i => i.as === 'tourn_circuits');
		if (existingTournCircuitInclude) {
			// Merge into existing include
			existingTournCircuitInclude.where = { tourn: scope.tournId };
			existingTournCircuitInclude.required = true;
		} else {
			// Create new include if not already present
			query.include.push({
				model: db.tournCircuit,
				as: 'tourn_circuits',
				where: { tourn: scope.tournId },
				attributes: [],      // don't need join table fields
				required: true,
			});
		}
	}
	const results = await db.circuit.findAll(query);
	return results.map(toDomain);
}

async function getCircuit(circuitId, opts = {}) {
	const query = buildCircuitQuery(opts);
	query.where.id = circuitId;
	const circuit = await db.circuit.findOne(query);
	return toDomain(circuit);
}

export async function createCircuit(circuit = {}) {
	const dbRow = await db.circuit.create(
		toPersistence(circuit)
	);
	await saveSettings({
		model: db.circuitSetting,
		settings: circuit.settings,
		ownerKey: 'circuit',
		ownerId: dbRow.id,
	});

	return dbRow.id;
}
export default {
	getCircuits,
	getCircuit,
	createCircuit,
};