import { Forbidden } from '../../../helpers/problem.js';
import db from '../../../data/db.js';

// Enables the Online Status Attendance dashboard functions
export async function categoryCheckin(req, res) {
	const perms = req.session.perms;

	if (!perms) {
		res.status(200).json({ error: true, message: 'You do not have access to that tournament' });
		return;
	}

	const categoryId = req.params.categoryId;

	if (
		perms.tourn[req.params.tournId] === 'owner'
		|| perms.tourn[req.params.tournId] === 'tabber'
		|| perms.tourn[req.params.tournId] === 'checker'
		|| perms.category[categoryId]
	) {

		const judges = await db.sequelize.query(`
			select judge.id, judge.active
			from judge
			where judge.category = :categoryId
		`, {
			replacements : { categoryId },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(judges);
	} else {
		return Forbidden(req, res, 'You do not have access to that tournament or category');
	}
};
categoryCheckin.openapi = {
	summary     : 'Given a category lists the judges who are present or absent for judge checkin',
	operationId : 'categoryCheckin',
	tags: ['tab/all'],
};

export async function eventCheckin(req, res) {
	const perms = req.session.perms;

	if (!perms) {
		res.status(200).json({ error: true, message: 'You do not have access to that tournament' });
		return;
	}

	const eventId = req.params.eventId;

	if (
		perms.tourn[req.params.tournId] === 'owner'
		|| perms.tourn[req.params.tournId] === 'tabber'
		|| perms.tourn[req.params.tournId] === 'checker'
		|| perms.event[eventId]
	) {

		const entries = await db.sequelize.query(`
			select entry.id, entry.active
				from entry
			where entry.event = :eventId
		`, {
			replacements : { eventId },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(entries);
	} else {
		return Forbidden(req, res, 'You do not have access to that tournament or event');
	}
};

