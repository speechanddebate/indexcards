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
		const perms = await permissionRepo.getPermissions({ tourn: tournId, person: personId });

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
				permTournId = perm.tourn	;
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

	if (!req.actor?.Person?.id) return next();

	// Fetch permissions where person matches req.actor.Person and tag is like 'api_auth_%'
	const perms = await db.personSetting.findAll({
		where: {
			person: req.actor.Person.id,
			tag: { [db.Sequelize.Op.like]: 'api_auth_%' },
		},
	});

	// Attach to req.auth.perms if needed, or handle as required
	req.auth = req.auth || {};
	req.auth.perms = perms.map(p => ({
		scope: p.tag,
		id: req.actor.Person.id,
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
	if(!req.actor?.Person?.id) return next();

	const perms = await permissionRepo.getPermissions({
		person: req.actor.Person.id,
		chapter: chapterId,
	});

	for (const perm of perms) {
		req.auth.perms.push({
			scope: 'chapter',
			id: perm.chapter,
			role: req.tag === 'chapter' ? 'chapterAdmin' : 'prefs',
		});
	}

	return next();
}