import personRepo from '../repos/personRepo.js';
import permissionRepo from '../repos/permissionRepo.js';
import { Unauthorized, Forbidden, NotImplemented } from '../helpers/problem.js';
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
export function requireSiteAdmin(req,res,next) {
	if (!req.person) {
		return Unauthorized(req, res,'User not Authenticated');
	}
	if (!req.person.siteAdmin){
		return Forbidden(req, res,'This Resource is Restricted to Site Administrators');
	}
	next();
}

export async function loadTournContext(req, res, next){

	//attach all relevant perms to the req.auth.perms object
	req.auth = req.auth || {};
	req.auth.perms = req.auth.perms || [];

	const tournId = req.params.tournId;
	const personId = req.person?.id;
	if (!tournId || !personId) return next();

	//fetch all perms for a tourn
	const perms = await permissionRepo.getPermissions({ tournId, personId });

	//TODO probably need to lookup district/circuit perms to add those as well

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
		req.auth.perms.push({
			scope,
			id,
			role: perm.tag,
		});
	}

	next();
}

/**
 * Require a specific capability on a resource for routes
 * @param {string} resource - e.g., 'tourn', 'event', 'round', 'section'
 * @param {string} capability - e.g., 'read', 'write', 'delete'
 */
export function requireAccess(resource, capability) {

	/**
	 * not the final form but the api is defined. it should take a resource and a capability and using the req.auth.perms
	 * determine if the user has access to the resource with the required capability. Probably needs more testing to ensure
	 * that parent/child relationships are properly handled and that 'inherited' permissions work as expected.
	 */
	return (req, res, next) => {
		if (!req.person || !req.auth || !req.auth.perms) {
			return Unauthorized(req, res,'User not Authenticated');
		}

		if(req.params.tournId === undefined){
			return Forbidden(req, res,'Tourn context is required for authorization');
		}

		//Site admins bypass all checks
		if (req.person.siteAdmin) {
			return next();
		};

		//roles as defined in db permission_tags. grants capabilities on scoped resource and it's children
		const ROLES = {
			'owner': ['read','write','delete', 'owner'],
			'tabber': ['read','write','delete'],
		};

		const CHILDREN = {
			'tourn': ['category','site'],
			'category': ['event','jpool','judge'],
			'event': ['round','entry'],
			'site': ['room'],
		};

		// Build list of resources that satisfy the requested resource
		// If resource is a child, include its parent(s) as valid scopes
		const validResources = [resource];
		let current = resource;
		let foundParent = true;
		while (foundParent) {
			foundParent = false;
			for (const [parent, children] of Object.entries(CHILDREN)) {
				if (children.includes(current)) {
					validResources.push(parent);
					current = parent;
					foundParent = true;
					break;
				}
			}
		}

		// Map scope to the correct param name
		const scopeParamMap = {
			tourn: 'tournId',
			event: 'eventId',
			category: 'categoryId',
			round: 'roundId',
			section: 'sectionId',
			// Add more as needed
		};

		// Check for any permission that matches a valid resource scope and grants the required capability
		const hasAccess = req.auth.perms.some(perm => {
			// Scope must be in validResources (resource or its parent)
			if (!validResources.includes(perm.scope)) return false;
			// Must match correct id for scope
			const paramName = scopeParamMap[perm.scope];
			if (paramName && req.params[paramName] !== undefined && perm.id !== req.params[paramName]) return false;
			// Role must grant the capability
			return ROLES[perm.role]?.includes(capability);
		});

		if (hasAccess) {
			return next();
		}

		// TODO: implement RBAC check

		return NotImplemented(req, res,`Not implemented: ${capability} on ${resource}`);
	};
}