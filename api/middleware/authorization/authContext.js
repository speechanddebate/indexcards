import permissionRepo from '../../repos/permissionRepo.js';
import eventRepo from '../../repos/eventRepo.js';
import  { createActor } from './authorization.js';
export async function loadTournAuthContext(req, res, next){

	req.actor = createActor(req);

	//attach all relevant perms to the req.auth.perms object
	req.auth = req.auth || {};
	req.auth.perms = req.auth.perms || [];

	// Unauthenticated request, skip loading perms
	const personId = req.person?.id;
	if (!personId) return next();

	//Tourn scoped request, load all of the perms for a tourn
	const tournId = req.params.tournId;
	if (tournId){
		//fetch all or a persons perms for a tourn
		const perms = await permissionRepo.getPermissions({ tournId, personId });

		// Collect unique event IDs for batch enrichment (only need categoryId)
		const eventIds = new Set();

		for (const perm of perms) {
			if (perm.event) eventIds.add(perm.event);
		}

		// Batch fetch categoryId for events
		const eventMap = new Map();

		if (eventIds.size > 0) {
			const events = await eventRepo.getEvents({ id: Array.from(eventIds) }, { fields: ['id', 'categoryId'] });
			for (const event of events) {
				eventMap.set(event.id, event.categoryId);
			}
		}

		for (const perm of perms) {
			let scope = null;
			let id = null;
			let categoryId = null;
			let permTournId = null;

			if (perm.event) {
				//event level perm
				scope = 'event';
				id = perm.event;
				categoryId = eventMap.get(perm.event);
				permTournId = perm.tourn; // already populated
			}
			else if (perm.category) {
				scope = 'category';
				id = perm.category;
				permTournId = perm.tourn; // already populated
			}
			else if (perm.tourn) {
				scope = 'tourn';
				id = perm.tourn;
				permTournId = perm.tourn;
			}

			if (scope && id) {
				const permObj = {
					scope,
					id,
					role: perm.tag,
				};
				if (categoryId) permObj.categoryId = categoryId;
				if (permTournId) permObj.tournId = permTournId;
				req.auth.perms.push(permObj);
			}
		}

		//TODO need to fetch all circuit level perms and attach those as well for proper RBAC to work,
		// but this is a start and covers the most common use case of checking perms within a tourn
	}
	return next();
}
