import personRepo from '../../repos/personRepo.js';
import { buildTarget } from './buildTarget.js';
import { Unauthorized, Forbidden } from '../../helpers/problem.js';
//requires login - use before any route that needs authentication
export function requireLogin(req, res, next) {
	if (!req.person) {
		return Unauthorized(req, res,'User not Authenticated');
	}
	next();
}
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
		allowedIds: auth.allowedIds,
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

	function allowedIds(resource, action, opts = {}) {
		if (!resource || !action) {
			throw new Error('Invalid auth call');
		}
		if (!req.person) {
			return { all: false, ids: [] };
		}
		if (req.person.siteAdmin) {
			return { all: true, ids: [] };
		}
		const perms = req.auth?.perms;
		if (!perms || !Array.isArray(perms)) {
			return { all: false, ids: [] };
		}

		return getAllowedResourceIds(resource, action, perms, opts);
	}

	return {
		can,
		assert,
		allowedIds,
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
		parentAccess: {
			tourn: ['tourn/read'],
			category: ['category/read'],
		},
	},
	tabber: {
		description: 'Tabber - manage resource and its children except ownership',
		permissions: [
			{
				actions: ['*/*'],
				notActions: ['tourn/owner'],
			},
		],
		parentAccess: {
			tourn: ['timeslot/read'],
			category: ['category/read', 'jpool/read'],
		},
	},
	circuit: {
		description: 'Circuit administrator - manage a circuit and its tourns',
		permissions: [
			{
				actions: ['*/*'],// allow any action on any scoped resource
			},
		],
	},
};
/**
 * Roles scoped to the parent resource can grant access to child resources. ex: action
 * *\/read on circuit scope grants read access to tourns in that circuit
 * Note: category and event are siblings under tourn, not parent-child (no inheritance)
 * but event can access category resources via parentAccess
 */
const CHILDREN = {
	tourn: ['category', 'event', 'timeslot'],   // Tourn has these direct children
	category: ['jpool'],            // Category has jpools as children
	event: ['round'],               // Event has these direct children
};

/**
 * Action hierarchy - higher actions grant lower actions
 * read > check
 *
 * Example: If a user has 'read' permission, they can also perform 'check' actions.
 * If denied 'read', they're also denied 'check'.
 */
const ACTION_HIERARCHY = {
	read: ['check'],
};

/**
 * Get all actions that would grant the requested action (including itself)
 * e.g., for 'check' returns ['check', 'read', 'write', 'owner']
 */
function getActionChain(action) {
	const chain = [action];

	// Find which higher actions grant this action
	for (const [higherAction, grantsActions] of Object.entries(ACTION_HIERARCHY)) {
		if (grantsActions.includes(action)) {
			chain.push(higherAction);
			// Recursively add even higher actions
			const higher = getActionChain(higherAction);
			chain.push(...higher.filter(a => !chain.includes(a)));
		}
	}

	return chain;
}

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
			// Denied takes precedence - check if any action in the chain is denied
			const actionChain = getActionChain(action);
			if (actionChain.some(act => p.notActions.some(pattern => actionMatches(pattern, targetResource, act)))) {
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
					const actionChain = getActionChain(action);
					if (actionChain.some(act => p.notActions.some(pattern => actionMatches(pattern, targetResource, act)))) continue;
					if (p.actions.some(pattern => actionMatches(pattern, targetResource, action))) return true;
				}
			}

			// Recurse to grandparents
			if (hasPermissionForResource(parent, action, { ...target, id }, perm, visited,targetResource)) {
				return true;
			}
		}
	}

	// Check parentAccess - child scope can access parent resources
	if (roleDef.parentAccess) {
		for (const [parentScope, allowedActions] of Object.entries(roleDef.parentAccess)) {
			const parentIdAttr = parentScope + 'Id';
			if (perm[parentIdAttr] && target[parentIdAttr] && perm[parentIdAttr] === target[parentIdAttr]) {
				if (allowedActions.some(pattern => actionMatches(pattern, targetResource, action))) {
					return true;
				}
			}
		}
	}

	return false;
}

function actionMatches(pattern, resource, action) {
	const [resPattern, actPattern] = pattern.split('/');
	const resMatch = resPattern === '*' || resPattern === resource;

	// Check exact match
	if (actPattern === '*' || actPattern === action) {
		return resMatch;
	}

	// Check if pattern action grants the requested action via hierarchy
	const grantsActions = ACTION_HIERARCHY[actPattern] || [];
	if (grantsActions.includes(action)) {
		return resMatch;
	}

	return false;
}

function roleAllowsAction(roleDef, resource, action) {
	for (const p of roleDef.permissions) {
		if (p.notActions?.some(pattern => actionMatches(pattern, resource, action))) {
			continue;
		}
		if (p.actions?.some(pattern => actionMatches(pattern, resource, action))) {
			return true;
		}
	}
	return false;
}

function getAllowedResourceIds(resource, action, perms, opts = {}) {
	const ids = new Set();
	let hasFullAccess = false;

	for (const perm of perms) {
		const roleDef = ROLES[perm.role];
		if (!roleDef) continue;

		// Check direct scope match
		if (perm.scope === resource && roleAllowsAction(roleDef, resource, action)) {
			ids.add(perm.id);
			continue;
		}

		// Check parent inheritance - can a parent scope grant access to this resource?
		for (const [parentScope, children] of Object.entries(CHILDREN)) {
			if (children.includes(resource) && perm.scope === parentScope) {
				if (roleAllowsAction(roleDef, resource, action)) {
					// Parent scope grants full access to this resource type
					hasFullAccess = true;
					break;
				}
			}
		}

		if (hasFullAccess) break;

		// Check parentAccess - can this child scope access parent resources?
		if (roleDef.parentAccess) {
			for (const [parentScope, allowedActions] of Object.entries(roleDef.parentAccess)) {
				if (resource === parentScope || (CHILDREN[parentScope]?.includes(resource))) {
					if (allowedActions.some(pattern => actionMatches(pattern, resource, action))) {
						// This child perm grants access to parent's resources
						const parentIdAttr = parentScope + 'Id';
						if (perm[parentIdAttr]) {
							// For resources under the parent scope, we'd need full access flag
							// For simplicity, mark as partial access requiring filtering
							if (resource === parentScope) {
								ids.add(perm[parentIdAttr]);
							}
						}
					}
				}
			}
		}
	}

	return { all: hasFullAccess, ids: Array.from(ids) };
}