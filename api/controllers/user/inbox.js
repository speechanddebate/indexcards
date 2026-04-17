import { NotFound } from '../../helpers/problem.js';
import messageRepo from '../../repos/messageRepo.js';

function mapMessage(message) {
	return {
		id: message.id,
		subject: message.subject,
		body: message.body,
		url: message.url,
		visibleAt: message.visible_at?.toISOString(),
		readAt: message.read_at?.toISOString() ?? null,
		Tourn: message.tourn_tourn
			? {
				id: message.tourn_tourn.id,
				name: message.tourn_tourn.name,
				webname: message.tourn_tourn.webname,
			}
			: null,
		Sender: message.sender_person
			? {
				name: [message.sender_person.first, message.sender_person.middle, message.sender_person.last].filter(Boolean).join(' '),
				email: message.sender_person.email,
			}
			: null,
		Email: message.email_email
			? {
				content: message.email_email.content,
			}
			: null,
	};
}

export const inboxList = async (req, res) => {
	const personId = req.actor.Person.id;
	const messages = await messageRepo.getMessages(personId,{
		excludeDeleted: true,
		excludeInvisible: true,
		include: {
			Tourn: true,
			Sender: true,
			Email: true,
		},
	});
	return res.status(200).json(messages.map(mapMessage));
};

export const getUnreadCount = async (req, res) => {
	const count = await messageRepo.getUnreadCount(req.actor.Person.id);
	return res.status(200).json({ count });
};

export const readAllMessages = async (req, res) => {
	await messageRepo.markAllMessagesRead(req.actor.Person.id);
	return res.status(204).end();
};

export const readMessage = async (req, res) => {
	const message = await messageRepo.getMessage(req.valid.params.messageId, req.actor.Person.id);
	if(!message) return NotFound(req,res,'Message not found');
	message.read_at = new Date();
	await message.save();
	return res.status(204).end();
};

export const getMessage = async (req, res) => {
	const message = await messageRepo.getMessage(req.valid.params.messageId, req.actor.Person.id,{
		excludeDeleted: true,
		excludeInvisible: true,
		include: {
			Tourn: true,
			Sender: true,
			Email: true,
		},
	});
	if(!message) return NotFound(req,res,'Message not found');
	return res.status(200).json(mapMessage(message));
};

export const deleteMessage = async (req, res) => {
	const message = await messageRepo.getMessage(req.valid.params.messageId, req.actor.Person.id);
	if(!message) return NotFound(req,res,'Message not found');
	message.deleted_at = new Date();
	await message.save();
	return res.status(204).end();
};

export default inboxList;
