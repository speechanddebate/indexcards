import { NotImplemented, BadRequest, NotFound } from '../../helpers/problem.js';
import siteRepo from '../../repos/siteRepo.js';
import roomRepo from '../../repos/roomRepo.js';

//tourns/:tournId/sites/:siteId
async function getSite(req, res) {
	if (!Number(req.params.siteId)) return BadRequest(req,res,'siteId is required');
	const site = await siteRepo.getSite({ siteId: req.params.siteId, tournId: req.params.tournId });
	if (!site) {
		return NotFound(req,res,`No site found for tournId:${req.params.tournId} with id ${req.params.siteId}`);
	}
	return res.json(site);
}
//tourns/:tournId/sites
async function getSites(req, res) {
	if (!req.params.tournId) return BadRequest(req,res,'tournId is required');
	const sites = await siteRepo.getSites({ tournId: req.params.tournId });
	if (!sites) return NotFound(req,res,'No sites found for tournId ' + req.params.tournId);
	return res.json(sites);

}
//tourns/:tournId/sites
async function createSite(req, res) {
	return NotImplemented(req,res,'this feature is not implemented yet');
}

//tourns/:tournId/sites/:siteId
async function updateSite(req, res) {
	return NotImplemented(req,res,'this feature is not implemented yet');
}
//tourns/:tournId/sites/:siteId
async function deleteSite(req, res) {
	return NotImplemented(req,res,'this feature is not implemented yet');
}

//tourns/:tournId/sites/:siteId/rooms/:roomId
async function getRoom(req, res) {
	if (!req.params.roomId) return BadRequest(req,res,'roomId is required');
	if (!req.params.siteId) return BadRequest(req,res,'siteId is required');
	if (!req.params.tournId) return BadRequest(req,res,'tournId is required');
	const room = await roomRepo.getRoom({
		roomId: req.params.roomId,
		siteId: req.params.siteId,
		tournId: req.params.tournId,
	});

	if (!room) {
		return NotFound(req,res,`No room found for tournId:${req.params.tournId} siteId:${req.params.siteId} with id ${req.params.roomId}`);
	}
	return res.json(room);
}

//tourns/:tournId/sites/:siteId/rooms
async function getRooms(req, res) {
	if (!req.params.siteId) return BadRequest(req,res,'siteId is required');
	if (!req.params.tournId) return BadRequest(req,res,'tournId is required');
	const rooms = await roomRepo.getRooms({ siteId: req.params.siteId, tournId: req.params.tournId });
	if (!rooms) {
		return NotFound(req,res,`No rooms found for tournId:${req.params.tournId} siteId:${req.params.siteId}`);
	}
	return res.json(rooms);
}

async function createRoom(req, res) {
	return NotImplemented(req,res,'this feature is not implemented yet');
}

async function updateRoom(req, res) {
	return NotImplemented(req,res,'this feature is not implemented yet');
}

async function deleteRoom(req, res) {
	return NotImplemented(req,res,'this feature is not implemented yet');
}

export default {
	getSite,
	getSites,
	createSite,
	updateSite,
	deleteSite,
	getRoom,
	getRooms,
	createRoom,
	updateRoom,
	deleteRoom,
};