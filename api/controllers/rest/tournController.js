import { NotFound } from '../../helpers/problem.js';
import tournRepo from '../../repos/tournRepo.js';
import eventRepo from '../../repos/eventRepo.js';
import { ToPublicPage } from '../mappers/pageMapper.js';
import fileRepo from '../../repos/fileRepo.js';

//TODO remove all references
import db from '../../data/db.js';

export async function getTourn(req, res) {
	var tourn = req.tourn;

	return res.status(200).json(tourn);
};

export async function getTournInvite(req, res) {
	var invite = {};

	invite = await tournRepo.getTourn(req.params.tournId, {
		include: {
			webpages: true,
			files: true,
		},
	});

	if (!invite?.id || invite?.hidden) {
		return NotFound(req, res, 'No such tournament found');
	}

	invite.webpages = (invite.webpages ?? []).map(ToPublicPage);
	invite.files = (invite.files ?? []).map(file => {
		return {
			id        : file.id,
			tag       : file.tag,
			type      : file.type,
			label     : file.label,
			filename  : file.filename,
			published : file.published,
			pageOrder : file.pageOrder,
			uploaded  : file.uploaded,
			updatedAt : file.updatedAt,
		};
	});
	invite.events = await eventRepo.getEventInvites(invite.id);
	invite.contacts = await tournRepo.getContacts(invite.id);

	return res.status(200).json(invite);
};

export async function getSchedule(req,res){
	const schedule = await tournRepo.getSchedule(req.params.tournId);
	return res.status(200).json(schedule);
};

export async function getPublishedFiles(req, res) {
	const files = await fileRepo.getFiles({ tournId: req.params.tournId });
	return res.status(200).json(files);
};

export async function getTournPublishedResults(req,res) {
	const results = await db.sequelize.query(`
			select
				result_set.id, result_set.label name, result_set.bracket, result_set.generated,
				result_set.published, result_set.coach,
				event.id eventId, event.name eventName, event.abbr eventAbbr, event.type eventType,
				sweep_set.id sweepSetId, sweep_set.name sweepSetName,
				sweep_award.id sweepAwardId, sweep_award.name sweepAwardName

			from (result_set, tourn)
				left join event on result_set.event = event.id and event.type != 'attendee'
				left join sweep_set on result_set.sweep_set = sweep_set.id
				left join sweep_award on sweep_award.id = sweep_set.sweep_award

			where 1=1
				and result_set.tourn = :tournId
				and result_set.published = 1
				and tourn.id = result_set.tourn
				and tourn.hidden = 0
		`, {
		replacements : { tournId: req.params.tournId },
		type         : db.sequelize.QueryTypes.SELECT,
	});

	res.status(200).json(results);
};