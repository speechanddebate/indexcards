import personRepo from '../../repos/personRepo.js';
import permissionRepo from '../../repos/permissionRepo.js';
import { buildTarget } from './buildTarget.js';
import { Unauthorized, Forbidden } from '../../helpers/problem.js';
// used for ext routes
export async function requireAreaAccess(req, res, next) {
	if (!req.person) {
		return Unauthorized(req, res,'User not Authenticated');
	}

	const personId = req.person.id;
	const area = req.params.area;
	const hasAccess = await personRepo.hasAreaAccess(personId, area);

	if (!hasAccess) {
		return Forbidden(req, res,`Access to ${area} is forbidden for your API credentials`);
	}

	next();
}
// should be rolled into the RBAC scheme at some point
export function requireSiteAdmin(req,res,next) {
	if (!req.person) {
		return Unauthorized(req, res,'User not Authenticated');
	}
	if (!req.person.siteAdmin){
		return Forbidden(req, res,'This Resource is Restricted to Site Administrators');
	}
	next();
}

export async function loadAuthContext(req, res, next){
	req.actor = createActor(req);

	//attach all relevant perms to the req.auth.perms object
	req.auth = req.auth || {};
	req.auth.perms = req.auth.perms || [];

	const tournId = req.params.tournId;
	const personId = req.person?.id;
	if (!tournId || !personId) return next();

	//fetch all perms for a tourn
	const perms = await permissionRepo.getPermissions({ tournId, personId });
	for (const perm of perms) {
		let scope = null;
		let id = null;

		if (perm.event) {
			scope = 'event';
			id = perm.event;
		}
		else if (perm.category) {
			scope = 'category';
			id = perm.category;
		}
		else if (perm.tourn) {
			scope = 'tourn';
			id = perm.tourn;
		}
		else if (perm.circuit) {
			scope = 'circuit';
			id = perm.circuit;
		}

		if (scope && id) {
			req.auth.perms.push({
				scope,
				id,
				role: perm.tag,
			});
		}
	}
	return next();
}

export function requireAccess(resource, action) {
	return async (req, res, next) => {
		if (!req.person) {
			return Unauthorized(req, res,'User not Authenticated');
		}
		const resourceId = Number(req.params[resource + 'Id']);
		try{
			await req.actor.assert(resource, action, resourceId);
			next();
		}
		catch(err){
			if (err.code === 'AUTH_FORBIDDEN'){
				return Forbidden(req, res,`You do not have permission to ${action} on ${resource}: ${resourceId}`);
			}
			return next(err);
		}
	};
}
export function createActor(req) {

	const auth = createAuthContext(req);
	return {
		id: req.person?.id,
		user: req.person,
		type: 'user',
		can: auth.can,
		assert: auth.assert,
	};
}

function createAuthContext(req) {

	// Per-request cache
	const targetCache = new Map();
	const permCache = new Map();

	async function can(resource, action, resourceId) {
		if (!resource || !action) {
			throw new Error('Invalid auth call');
		}

		const key = `${resource}:${resourceId}`;

		// Build target once per request
		let target = targetCache.get(key);

		if (!target) {
			target = await buildTarget(resource, resourceId, req, targetCache);
			targetCache.set(key, target);
		}
		const permKey = `${resource}:${action}:${resourceId}`;

		if (permCache.has(permKey)) {
			return permCache.get(permKey);
		}

		const result = checkAccess(
			resource,
			action,
			target,
			req.person,
			req.auth?.perms
		);

		permCache.set(permKey, result);

		return result;
	}

	async function assert(resource, action, resourceId) {
		const ok = await can(resource, action, resourceId);

		if (!ok) {
			const err = new Error('Forbidden');
			err.status = 403;
			err.code = 'AUTH_FORBIDDEN';
			throw err;
		}

		return true;
	}

	return {
		can,
		assert,
	};
}

const ROLES = {
	owner: {
		description: 'Resource Owner - full access to resource and its children',
		permissions: [
			{
				actions: ['*/*'],
				notActions: [],
			},
		],
	},
	tabber: {
		description: 'Tabber - manage resource and its children except ownership',
		permissions: [
			{
				actions: ['*/*'],
				notActions: ['tourn/owner'],
			},
		],
	},
	circuit: {
		description: 'Circuit administrator - manage a circuit and its tourns',
		permissions: [
			{
				actions: ['*/*'],            // allow any action on any scoped resource
				notActions: ['tourn/owner'], // deny only owner on tourn
			},
		],
	},
};
/**
 * Roles scoped to the parent resource can grant access to child resources. ex: action
 * *\/read on circuit scope grants read access to tourns in that circuit
 */
const CHILDREN = {
	circuit	: ['tourn'],            // Circuit has these direct children
	tourn: ['category', 'event'],   // Tourn has these direct children
	category: ['event'],            // Category has these direct children
	event: ['round'],               // Event has these direct children
};

export function checkAccess(resource, action, target, person, perms){

	if(!person){
		return false;
	}
	//Site admins bypass all checks
	if (person.siteAdmin) return true;
	if (!perms || !Array.isArray(perms)) return false;

	return perms.some(perm => hasPermissionForResource(resource, action, target, perm));
}

function hasPermissionForResource(resource, action, target, perm, visited = new Set(),targetResource=resource) {
	const roleDef = ROLES[perm.role];
	if (!roleDef) {
		throw new Error(`Role definition for '${perm.role}' is not implemented`);
	}

	//Check direct match on this resource
	if (!perm.id || (perm.scope === resource && perm.id === target.id)) {
		for (const p of roleDef.permissions) {
		// Denied takes precedence
			if (p.notActions.some(pattern => actionMatches(pattern, targetResource, action))) {
				continue;
			}
			// Allowed patterns
			if (p.actions.some(pattern => actionMatches(pattern, targetResource, action))) {
				return true;
			}
		}
	}

	//Check parent resources recursively
	for (const parent of Object.keys(CHILDREN)) {
		if (!CHILDREN[parent].includes(resource)) continue;

		const parentIdKey = parent + (Array.isArray(target[parent + 'Ids']) ? 'Ids' : 'Id');
		const parentIds = Array.isArray(target[parentIdKey]) ? target[parentIdKey] : [target[parentIdKey]];

		for (const id of parentIds) {
			const cacheKey = `${perm.role}:${parent}:${id}`;
			if (visited.has(cacheKey)) continue;
			visited.add(cacheKey);

			// Check if permission directly matches parent
			if (perm.scope === parent && perm.id === id) {
				for (const p of roleDef.permissions) {
					if (p.notActions.some(pattern => actionMatches(pattern, targetResource, action))) continue;
					if (p.actions.some(pattern => actionMatches(pattern, targetResource, action))) return true;
				}
			}

			// Recurse to grandparents
			if (hasPermissionForResource(parent, action, { ...target, id }, perm, visited,targetResource)) {
				return true;
			}
		}
	}

	return false;
}

function actionMatches(pattern, resource, action) {
	const [resPattern, actPattern] = pattern.split('/');
	const resMatch = resPattern === '*' || resPattern === resource;
	const actMatch = actPattern === '*' || actPattern === action;
	return resMatch && actMatch;
}