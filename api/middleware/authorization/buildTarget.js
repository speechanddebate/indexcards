
import categoryRepo from '../../repos/categoryRepo.js';
import eventRepo from '../../repos/eventRepo.js';
import sectionRepo from '../../repos/sectionRepo.js';
import roundRepo from '../../repos/roundRepo.js';
import timeslotRepo from '../../repos/timeslotRepo.js';

export async function buildTarget(resource, resourceId, targetCache) {
	const key = `${resource}:${resourceId}`;
	if (targetCache.has(key)) return targetCache.get(key);

	let target = { id: resourceId, resource };
	//no parents to build
	if(resource.startsWith('api_auth_')){
		targetCache.set(key, target);
		return target;
	}
	if(resource === 'chapter'){
		targetCache.set(key, target);
		return target;
	}

	//build tourn target
	switch (resource) {
		case 'category': {
			const category = await categoryRepo.getCategory(resourceId, { fields: ['tournId'] });
			if (category) {
				target.tournId = category.tournId;
				target ={
					...await buildTarget('tourn', target.tournId, targetCache),
					...target,
				};
			}
			break;
		}
		case 'event': {
			const event = await eventRepo.getEvent(resourceId, { fields: ['tournId', 'categoryId'] });
			if (event) {
				target.tournId = event.tournId;
				target.categoryId = event.categoryId;
				target ={
					...await buildTarget('tourn', target.tournId, targetCache),
					...target,
				};
			}
			break;
		}
		case 'round': {
			const round = await roundRepo.getRound(resourceId, { fields: ['eventId'] });
			if (round) {
				target.eventId = round.eventId;
				target ={
					...await buildTarget('event', target.eventId, targetCache),
					...target,
				};
			}
			break;
		}
		case 'section': {
			const section = await sectionRepo.getSection(resourceId, { fields: ['roundId'] });
			if (section) {
				target.roundId = section.roundId;
				target ={
					...await buildTarget('round', target.roundId, targetCache),
					...target,
				};
			}
			break;
		}
		case 'timeslot': {
			const timeslot = await timeslotRepo.getTimeslot(resourceId, { fields: ['tournId'] });
			if (timeslot) {
				target.tournId = timeslot.tournId;
				target ={
					...await buildTarget('tourn', target.tournId, targetCache),
					...target,
				};
			}
			break;
		}
		// no parent scopes to load
		case 'circuit':
		case 'tourn': {
			break;
		}
		default:
			throw new Error(`Unknown resource type: ${resource}`);
	}

	targetCache.set(key, target);
	return target;
}