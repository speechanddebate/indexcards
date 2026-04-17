import db from '../data/db.js';
import { tournInclude } from './tournRepo.js';
import { personInclude } from './personRepo.js';
import { emailInclude } from './emailRepo.js';

async function buildMessageQuery(opts = {}) {
	const query = {
		where: {},
		include: [],
	};

	if(opts.excludeDeleted) {
		query.where.deleted_at = null;
	}

	if(opts.excludeInvisible) {
		query.where.visible_at = {
			[db.Sequelize.Op.lt]: db.Sequelize.fn('NOW'),
		};
	}
	if(opts.include?.Tourn){
		query.include.push({
			...tournInclude(opts.include.Tourn),
			as: 'tourn_tourn',
			required: false,
		});
	}
	if(opts.include?.Sender){
		query.include.push({
			...(await personInclude(opts.include.Sender)),
			as: 'sender_person',
			required: false,
		});
	}
	if(opts.include?.Email){
		query.include.push({
			...emailInclude(opts.include.Email),
			as: 'email_email',
			required: false,
		});
	}

	query.order = [['created_at', 'DESC'],['subject', 'DESC']];

	return query;
}

async function getMessage(messageId, personId,opts={}) {
	const query = await buildMessageQuery(opts);
	query.where = { id: messageId };

	if (personId !== undefined && personId !== null) {
		query.where.person = personId;
	}
	return await db.message.findOne(query);
};

async function getMessages( personId, opts={} ) {
	const query = await buildMessageQuery(opts);
	query.where.person = personId;
	const messages = await db.message.findAll(query);
	return messages;
}

/**cGets the count of unread messages for a specific person
 * @param {Int} personId - The ID of the person whose unread messages are being counted
 * @returns {Promise<Int>} - The count of unread messages for the specified person
 */
async function getUnreadCount(personId) {
	if (personId === undefined || personId === null) {
		throw new Error('personId is required');
	}

	return db.message.count({
		distinct: true,
		col: 'id',
		where: {
			person: personId,
			read_at: null,
			deleted_at: null,
			visible_at: {
				[db.Sequelize.Op.lt]: db.Sequelize.fn('NOW'),
			},
		},
	});
};
/** Mark all of a person's visible messages as read
 * @param {*} personId - The ID of the person whose messages are being marked as read
 * @returns {Promise<Int>} - The number of messages that were marked as read
 */
async function markAllMessagesRead(personId) {
	//should not mark messages that are already read or not yet visible
	const res = await db.message.update(
		{ read_at: db.Sequelize.fn('NOW') },
		{
			where: {
				person: personId,
				read_at: null,
				visible_at: {
					[db.Sequelize.Op.lt]: db.Sequelize.fn('NOW'),
				},
			},
		}
	);
	return res[0];
};

async function createMessage(data) {
	const message = await db.message.create(data);
	return message.id;
};

export default {
	getMessage,
	getMessages,
	getUnreadCount,
	markAllMessagesRead,
	createMessage,
};