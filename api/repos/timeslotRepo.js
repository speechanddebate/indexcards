import db from '../data/db.js';
import { FIELD_MAP, toDomain } from './mappers/timeslotMapper.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';

function buildTimeslotQuery(opts = {}){
	const query  = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields,FIELD_MAP),
		include: [],
	};
	return query;
}

export function timeslotInclude(opts = {}){
	return {
		model: db.timeslot,
		as: 'timeslots',
		...buildTimeslotQuery(opts),
	};
}

async function getTimeslot(id, opts = {}) {
	const query = buildTimeslotQuery(opts);
	query.where.id = id;
	const timeslot = await db.timeslot.findOne(query);
	return toDomain(timeslot);
}

export default {
	getTimeslot,
};