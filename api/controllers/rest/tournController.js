import { NotFound } from '../../helpers/problem.js';
import tournRepo from '../../repos/tournRepo.js';
import eventRepo from '../../repos/eventRepo.js';

export async function getTournInvite(req, res) {
	const invite = {};

	invite.tourn = await tournRepo.getTourn(req.params.tournId);

	if (!invite.tourn?.id || invite.tourn?.hidden) {
		return NotFound(req, res, 'No such tournament found');
	}

	invite.pages = await tournRepo.getPages(invite.tourn.id);
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
	parameters: [
		{
			in: 'path',
			name: 'tournId',
			required: true,
			schema: {
				type: 'string',
			},
			description: 'The ID or webname of the tournament to get the invite for.',
		},
	],
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