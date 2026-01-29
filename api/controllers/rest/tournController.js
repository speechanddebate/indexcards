import { NotFound } from '../../helpers/problem.js';
import tournRepo from '../../repos/tournRepo.js';
import eventRepo from '../../repos/eventRepo.js';
import { ToPublicPage } from '../mappers/pageMapper.js';

//TODO remove all references
import db from '../../data/db.js';

export async function getTourn(req, res) {
	var tourn = req.tourn;

	return res.status(200).json(tourn);
};
getTourn.openapi = {
	summary: 'Get Public Tournament',
	description: 'Retrieve public information about a specific tournament.',
	tags: ['Tournaments'],
	responses: {
		200: {
			description: 'Tournament information',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/Tournament',
					},
				},
			},
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
};

export async function getTournInvite(req, res) {
	var invite = {};

	invite = await tournRepo.getTourn(req.params.tournId);

	if (!invite?.id || invite?.hidden) {
		return NotFound(req, res, 'No such tournament found');
	}

	invite.pages = (await tournRepo.getPages(invite.id)).map(ToPublicPage);
	invite.files = (await tournRepo.getFiles(invite.id)).map(file => {
		return {
			id: file.id,
			tag: file.tag,
			type: file.type,
			label: file.label,
			filename: file.filename,
			published: file.published,
			pageOrder: file.pageOrder,
			uploaded: file.uploaded,
			updatedAt: file.updatedAt,
		};
	});
	invite.events = await eventRepo.getEventInvites(invite.id);
	invite.contacts = await tournRepo.getContacts(invite.id);

	return res.status(200).json(invite);
};
getTournInvite.openapi = {
	summary: 'Get Tournament Invite',
	description: 'Retrieve a public invite for a specific tournament, including pages, files, events, and contacts.',
	tags: ['Tournaments'],
	responses: {
		200: {
			description: 'A public invite to a tournament',
			content: {
				'application/json': {
					schema: {
						$ref: '#/components/schemas/TournInvite',
					},
				},
			},
		},
		401 : {
			$ref : '#/components/responses/Unauthorized',
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
		default: {
			$ref: '#/components/responses/Error',
		},
	},
};

export async function getSchedule(req,res){
	const schedule = await tournRepo.getSchedule(req.params.tournId);
	return res.status(200).json(schedule);
};
getSchedule.openapi = {
	tags: ['Tournaments'],
};

export async function getPublishedFiles(req, res) {
	const files = await tournRepo.getFiles(req.params.tournId);
	return res.status(200).json(files);
};
getPublishedFiles.openapi = {
	summary: 'Get Tournament Files',
	description: 'Retrieve a list of published files associated with a specific tournament.',
	tags: ['Tournaments'],
	responses: {
		200: {
			description: 'List of tournament files',
			content: {
				'application/json': {
					schema: {
						type: 'array',
						items: {
							$ref: '#/components/schemas/File',
						},
					},
				},
			},
		},
		404: {
			$ref: '#/components/responses/NotFound',
		},
	},
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

getTournPublishedResults.openapi = {
	summary     : 'Returns an array of result_sets that are published in a tournament',
	operationId : 'getTournPublishedResults',
	responses: {
		200: {
			description: 'Array of events',
			content: {
				'application/json': {
					schema: {
						type: 'array',
					},
				},
			},
		},
	},
	tags: ['invite', 'public', 'results'],
};