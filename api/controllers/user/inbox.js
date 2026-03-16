import { BadRequest } from '../../helpers/problem.js';
import messageRepo from '../../repos/messageRepo.js';
export const inboxList = async (req, res) => {
	const inbox = await messageRepo.getMessages(req.person.id);
	return res.status(200).json(inbox);
};

export const getUnreadCount = async (req, res) => {
	const count = await messageRepo.getUnreadCount(req.person.id);
	return res.status(200).json({ count });
};

export const markAllMessagesRead = async (req, res) => {
	await messageRepo.markAllMessagesRead(req.person.id);
	return res.status(201).end();
};

export const markMessageRead = async (req, res) => {
	await messageRepo.markMessageRead(req.body.messageId);
	return res.status(201).end();
};

export const markMessageDeleted = async (req, res) => {
	if(req.body.messageId === undefined) return BadRequest(req,res,'a message id is required');

	await messageRepo.markMessageDeleted(req.body.messageId, req.person.id);
	return res.status(201).end();
};

export default inboxList;
