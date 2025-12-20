import personRepo from '../repos/personRepo.js';
import { Unauthorized, Forbidden } from '../helpers/problem.js';
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