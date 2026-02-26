import db from '../data/db.js';
import  { FIELD_MAP, toDomain, toPersistence } from './mappers/roundMapper.js';
import { eventInclude } from './eventRepo.js';
import { withSettingsInclude } from './utils/settings.js';
import { resolveAttributesFromFields } from './utils/repoUtils.js';
import { sectionInclude } from './sectionRepo.js';

function buildRoundQuery(opts = {}) {
	const query = {
		where: {},
		attributes: resolveAttributesFromFields(opts.fields, FIELD_MAP),
		include: [],
	};

	if(!opts.unpublished){
		query.where.published = 1;
	}

	query.include.push(
		...withSettingsInclude({
			model: db.roundSetting,
			as: 'round_settings',
			settings: opts.settings,
		})
	);

	if (opts.include?.event) {
		const eventOpts =
			opts.include.event === true
				? { fields: ['id','name','abbr','type','level'], settings: [] }
				: opts.include.event;

		query.include.push({
			...eventInclude({
				...eventOpts,
			}),
			as: 'event_event',
		});
	}
	if(opts.include?.sections){
		query.include.push({
			...sectionInclude(opts.include.sections),
		});
	}
	return query;
}

export function roundInclude(opts = {}) {
	return {
		model: db.round,
		as: 'rounds',
		...buildRoundQuery(opts),
	};
}

/**
 * Fetches rounds from the database with optional filters and event information.
 */

export async function getRounds(scope = {}, opts = {}) {
	const query = buildRoundQuery(opts);

	if (scope.eventId) {
		query.where.event = scope.eventId;
	}

	if (scope.tournId) {
		// Try to find an existing event include
		let eventIncIdx = query.include.findIndex(i => i.as === 'event_event');

		// If it doesn't exist, add a JOIN-ONLY include
		if (eventIncIdx === -1) {
			query.include.push({
				model      : db.event,
				as         : 'Event',
				attributes : [], // join-only include
				required   : true,
				where      : {
					tourn: scope.tournId,
				},
			});
		} else {
			// Enforce scope
			query.include[eventIncIdx] = {
				...query.include[eventIncIdx],
				required: true,
				where: {
					...(query.include[eventIncIdx].where || {}),
					tourn: scope.tournId,
				},
			};
		}
	}

	const rounds = await db.round.findAll(query);
	return rounds.map(toDomain);
}

async function createRound(data){
	const dbRow = await db.round.create(toPersistence(data));
	return dbRow.id;
}

export default {
	getRounds,
	createRound,
};