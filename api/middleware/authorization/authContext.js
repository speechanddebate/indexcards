import permissionRepo from '../../repos/permissionRepo.js';
import eventRepo from '../../repos/eventRepo.js';
import db from '../../data/db.js';

export async function loadTournAuthContext(req, res, next, tournId){

	//attach all relevant perms to the req.auth.perms object
	req.auth = req.auth || {};
	req.auth.perms = req.auth.perms || [];

	// Unauthenticated request, skip loading perms
	const personId = req.person?.id;
	if (!personId) return next();

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

			if (perm.eventId) {
				//event level perm
				scope = 'event';
				id = perm.eventId;
				categoryId = eventMap.get(perm.eventId);
				permTournId = perm.tournId; // already populated
			}
			else if (perm.categoryId) {
				scope = 'category';
				id = perm.categoryId;
				permTournId = perm.tournId; // already populated
			}
			else if (perm.tournId) {
				scope = 'tourn';
				id = perm.tournId;
				permTournId = perm.tournId	;
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
	}
	return next();
}
export async function loadExtAuthContext(req, res, next) {

	if (!req.actor?.person?.id) return next();

	// Fetch permissions where person matches req.actor.person and tag is like 'api_auth_%'
	const perms = await db.personSetting.findAll({
		where: {
			person: req.actor.person.id,
			tag: { [db.Sequelize.Op.like]: 'api_auth_%' },
		},
	});

	// Attach to req.auth.perms if needed, or handle as required
	req.auth = req.auth || {};
	req.auth.perms = perms.map(p => ({
		scope: p.tag,
		id: req.actor.person.id,
		role: 'authorized',
	}));

	return next();
}
/** load all the chapter perms for the actor */
export async function loadChapterAuthContext(req, res, next,chapterId) {
	//attach all relevant perms to the req.auth.perms object
	req.auth = req.auth || {};
	req.auth.perms = req.auth.perms || [];

	//cannot load perms when there is no person
	if(!req.actor?.person?.id) return next();

	const perms = await permissionRepo.getPermissions({
		personId: req.actor.person.id,
		chapterId,
	});

	for (const perm of perms) {
		req.auth.perms.push({
			scope: 'chapter',
			id: perm.chapterId,
			role: req.tag === 'chapter' ? 'chapterAdmin' : 'prefs',
		});
	}

	return next();
}