import sectionRepo from '../../repos/sectionRepo.js';
import eventRepo from '../../repos/eventRepo.js';
import roundRepo from '../../repos/roundRepo.js';
import categoryRepo from '../../repos/categoryRepo.js';
export async function buildTarget(resource, resourceId, req, targetCache) {
	const key = `${resource}:${resourceId}`;
	if (targetCache.has(key)) return targetCache.get(key);

	let target = { id: resourceId, resource };

	switch (resource) {
		case 'category': {
			const category = await categoryRepo.getCategory(resourceId, { fields: ['tournId'] });
			if (category) {
				target.tournId = category.tournId;
				target ={
					...await buildTarget('tourn', target.tournId, req, targetCache),
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
					...await buildTarget('tourn', target.tournId, req, targetCache),
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
					...await buildTarget('event', target.eventId, req, targetCache),
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
					...await buildTarget('round', target.roundId, req, targetCache),
					...target,
				};
			}
			break;
		}
		case 'circuit':
		case 'tourn': {
			// no parent scopes to load
			break;
		}
		default:
			throw new Error(`Unknown resource type: ${resource}`);
	}

	targetCache.set(key, target);
	return target;
}