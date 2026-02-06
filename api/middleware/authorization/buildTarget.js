import circuitRepo from '../../repos/circuitRepo.js';
import eventRepo from '../../repos/eventRepo.js';
import categoryRepo from '../../repos/categoryRepo.js';
export async function buildTarget(resource, resourceId, req, targetCache) {
	const key = `${resource}:${resourceId}`;
	if (targetCache.has(key)) return targetCache.get(key);

	let target = { id: resourceId, resource };

	switch (resource) {
		case 'tourn': {
			const circuits = await circuitRepo.getCircuits({ tournId: resourceId }, { fields: ['id'] });
			target.circuitIds = circuits.map(c => c.id);
			break;
		}
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
		default:
			throw new Error(`Unknown resource type: ${resource}`);
	}

	targetCache.set(key, target);
	return target;
}