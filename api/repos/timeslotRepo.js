import db from '../data/db.js';
import { ValidationError } from '../helpers/errors/errors.js';
import { FIELD_MAP, toDomain, toPersistence } from './mappers/timeslotMapper.js';
import { resolveAttributesFromFields, isForeignKeyError } from './utils/repoUtils.js';
import { roundInclude } from './roundRepo.js';

function buildTimeslotQuery(opts = {}, scope = {}) {
	const query  = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields,FIELD_MAP),
		include: [],
	};

	if (scope?.tournId) {
		query.where.tourn = scope.tournId;
	}

	if (opts.include?.rounds) {
		query.include.push({
			...roundInclude(opts.include.rounds),
			as: 'rounds',
			required: false,
		});
	}

	return query;
}

export function timeslotInclude(opts = {}){
	return {
		model: db.timeslot,
		as: 'timeslots',
		...buildTimeslotQuery(opts),
	};
}
async function getTimeslot(ref, opts = {}) {
	if (!ref) throw new Error('getTimeslot: id or scope is required');
	const isScoped = typeof ref === 'object';
	const id = isScoped ? ref.id : ref;
	if (!id) throw new Error('getTimeslot: id is required');
	const scope = isScoped ? { ...ref } : {};
	delete scope.id;
	const query = buildTimeslotQuery(opts, scope);
	query.where.id = id;
	const timeslot = await db.timeslot.findOne(query);
	return toDomain(timeslot);
}
async function getTimeslots(scope, opts = {}) {
	const query = buildTimeslotQuery(opts, scope);
	const timeslots = await db.timeslot.findAll(query);
	return timeslots.map(toDomain);
}

async function createTimeslot(timeslotData) {
	const persistenceData = toPersistence(timeslotData);
	try {
		const newTimeslot = await db.timeslot.create(persistenceData);
		return newTimeslot.id;
	} catch (err) {
		// Only map FK errors for the `tourn` foreign key to a ValidationError
		if (isForeignKeyError(err, 'fk_timeslot_tourn')) {
			throw new ValidationError('tournId does not reference an existing tournament');
		}
		throw err;
	}
}

async function updateTimeslot(timeslotId, timeslotData) {
	if (!timeslotId) throw new Error('updateTimeslot: Timeslot ID is required');
	const persistenceData = toPersistence(timeslotData);
	const [rowsUpdated] = await db.timeslot.update(persistenceData, {
		where: { id: timeslotId },
	});
	return rowsUpdated > 0 ? timeslotId : null;
}

async function deleteTimeslot(timeslotId) {
	if (!timeslotId) throw new Error('deleteTimeslot: Timeslot ID is required');
	const rows = await db.timeslot.destroy({where: { id: timeslotId }});
	return rows > 0;
}

export default {
	getTimeslot,
	getTimeslots,
	createTimeslot,
	updateTimeslot,
	deleteTimeslot,
};