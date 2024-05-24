export const inboxList = {
	GET: async (req, res) => {

		const inbox = await req.db.sequelize.query(`
			select
				message.*,
				tourn.name tournName, tourn.id tournId, tourn.webname,
				sender.first, sender.middle, sender.last, sender.email sender_mail,
				CONVERT_TZ(message.created_at, '+00:00', person.tz) as createdAt,
				CONVERT_TZ(message.read_at, '+00:00', person.tz) as readAt,
				( CASE
					WHEN message.read_at IS NULL THEN 'N'
					ELSE 'Y'
					END) as readStatus
			from (message, person)
				left join tourn on message.tourn = tourn.id
				left join person sender on message.sender = sender.id
			where message.person = :personId
				and message.person = person.id
				and message.deleted_at IS NULL
			order by
				message.created_at,
				message.subject
		`, {
			replacements: { personId: req.session.person },
			type: req.db.Sequelize.QueryTypes.SELECT,
		});

		return res.status(201).json(inbox);
	},
};

export const unreadCount = {
	GET: async (req, res) => {

		const unreads = await req.db.sequelize.query(`
			select
				count(distinct message.id) as unreadCount
			from message
			where message.person = :personId
				and message.read_at IS NULL
				and message.deleted_at IS NULL
		`, {
			replacements: { personId: req.session.person },
			type: req.db.Sequelize.QueryTypes.SELECT,
		});

		return res.status(201).json(unreads[0]?.unreadCount);

	},
};

export const markMessageRead = {
	POST: async (req, res) => {

		const unreads = await req.db.sequelize.query(`
			update
				message
			set message.read_at = NOW()
			where message.id = :messageId
		`, {
			replacements: { messageId: req.body.messageId },
			type: req.db.Sequelize.QueryTypes.UPDATE,
		});

		return res.status(201).json(unreads);
	},
};

export const markMessageDeleted = {
	POST: async (req, res) => {

		const unreads = await req.db.sequelize.query(`
			update
				message
			set message.deleted_at = NOW()
			where message.id = :messageId
		`, {
			replacements: { messageId: req.body.messageId },
			type: req.db.Sequelize.QueryTypes.UPDATE,
		});

		return res.status(201).json(unreads);
	},
};

export default inboxList;
