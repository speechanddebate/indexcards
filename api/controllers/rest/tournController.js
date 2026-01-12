import { NotFound } from '../../helpers/problem.js';
import tournRepo from '../../repos/tournRepo.js';
import eventRepo from '../../repos/eventRepo.js';
import { ToPublicPage } from '../mappers/pageMapper.js';

export async function getTourn(req, res) {
	const tourn = req.tourn;

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
	const invite = {};

	invite.tourn = await tournRepo.getTourn(req.params.tournId);

	if (!invite.tourn?.id || invite.tourn?.hidden) {
		return NotFound(req, res, 'No such tournament found');
	}

	invite.pages = (await tournRepo.getPages(invite.tourn.id)).map(ToPublicPage);
	invite.files = (await tournRepo.getFiles(invite.tourn.id)).map(file => {
		return {
			id: file.id,
			tag: file.tag,
			type: file.type,
			label: file.label,
			filename: file.filename,
			published: file.published,
			pageOrder: file.pageOrder,
			uploaded: file.uploaded,
			lastModified: file.lastModified,
		};
	});
	invite.events = await eventRepo.getEventInvites(invite.tourn.id);
	invite.contacts = await tournRepo.getContacts(invite.tourn.id);

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
export async function getTournEvents(req, res) {
	const events = await eventRepo.getEvents(req.params.tournId);
	return res.status(200).json(events);
};
getTournEvents.openapi = {
	summary: 'Get Tournament Events',
	description: 'Retrieve a list of events associated with a specific tournament.',
	tags: ['Tournaments'],
	responses: {
		200: {
			description: 'List of tournament events',
		},
		404: {
			$ref: '#/components/responses/NotFound',
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

