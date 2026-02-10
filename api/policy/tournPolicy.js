import tournRepo from '../repos/tournRepo.js';
import { NotFound, BadRequest } from '../helpers/problem.js';
export async function requirePublicTourn(req,res,next){

	if (!req.params.tournId) return BadRequest(req,res,'you must provide a tourn ID');

	const tourn = await tournRepo.getTourn(req.params.tournId);

	if (!tourn?.id || tourn?.hidden) {
		return NotFound(req, res, 'No such tournament found');
	}
	req.tourn = tourn;
	next();
}