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

export async function getTourns(req,res) {
	const fields = {};
	//These should probably be handled by a distinct function in the future RCT
	if(req.valid.query.fields){
		fields.root = req.valid.query.fields.split(',').map(f => f.trim());
	}
	if(req.valid.query['fields[events]']){
		fields.events = req.valid.query['fields[events]'].split(',').map(f => f.trim())
		.filter(field => ['id','name','type','abbr','level'].includes(field)); //list of allowed fields
	}
	const query = req.valid.query;
	const opts = {
		fields: fields.root,
		hasPublishedResults: query.publishedResults,
		limit: query.limit,
		offset: query.offset,
	};

	if (fields.events?.length) {
		opts.include = {
			events: {
				fields: fields.events,
			},
		};
	}
	const tourns = await tournRepo.getTourns({
		circuit: query.circuit,
		startBefore: query.startBefore,
		startAfter: query.startAfter,
	}, opts);

	return res.status(200).json(tourns.map(t => {
		return {
			id: t.id,
			name: t.name,
			city: t.city,
			state: t.state,
			country: t.country,
			tz: t.tz,
			webname: t.webname,
			start: t.start,
			end: t.end,
			regStart: t.reg_start,
			regEnd: t.reg_end,
			Events: t.events,
		};
	}));
}

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

	invite.Webpages = (invite.webpages ?? []).map(ToPublicPage);
	delete invite.webpages;
	invite.Files = (invite.files ?? []).map(file => {
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
	delete invite.files;
	invite.Events = await eventRepo.getEventsForInvite(invite.id);
	invite.Contacts = await tournRepo.getContacts(invite.id);

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