import db from '../data/db.js';

async function getMessage(messageId, personId) {
	const where = { id: messageId };

	if (personId !== undefined && personId !== null) {
		where.person = personId;
	}
	return await db.message.findOne({ where, raw: true });
};
async function getMessages(personId) {
	return await db.sequelize.query(`
		select
			message.*,
			tourn.name tournName, tourn.id tournId, tourn.webname,
			sender.first, sender.middle, sender.last, sender.email sender_mail,
			email.content,
			CONVERT_TZ(message.created_at, '+00:00', person.tz) as createdAt,
			CONVERT_TZ(message.read_at, '+00:00', person.tz) as readAt,
			( CASE
				WHEN message.read_at IS NULL THEN 'N'
				ELSE 'Y'
				END) as readStatus
		from (message, person)
			left join tourn on message.tourn = tourn.id
			left join person sender on message.sender = sender.id
			left join email on email.id = message.email
		where message.person = :personId
			and message.person = person.id
			and message.deleted_at IS NULL
			and message.visible_at < NOW()
		order by
			message.created_at,
			message.subject
	`, {
		replacements: { personId },
		type: db.Sequelize.QueryTypes.SELECT,
	});
};
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
/** Marks a message as read
 * @param {*} messageId the Id of the message to mark read
 * @param {*} personId an optional personId to limit to a single persons messages
 * @returns true if successful
 */
async function markMessageRead(messageId, personId) {
	const where = {
		id: messageId,
		read_at: null,
	};

	if (personId !== undefined && personId !== null) {
		where.person = personId;
	}

	const [affectedRows] = await db.message.update(
		{ read_at: db.Sequelize.fn('NOW') },
		{ where }
	);
	return affectedRows > 0;
};

/**
 *  Marks a message as deleted
 * @param {*} messageId the Id of the message to mark deleted
 * @param {*} personId an optional personId to limit to a single persons messages
 * @returns true if successful
 */
async function markMessageDeleted (messageId, personId) {
	const where = { id: messageId };

	if (personId !== undefined && personId !== null) {
		where.person = personId;
	}

	const [affectedRows] = await db.message.update(
		{ deleted_at: db.Sequelize.fn('NOW') },
		{ where }
	);
	return affectedRows > 0;
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
	markMessageRead,
	markMessageDeleted,
	createMessage,
};