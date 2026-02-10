// import { showDateTime } from '../../../helpers/common';

import { UnexpectedError } from '../../../helpers/problem.js';
import db from '../../../data/db.js';

// General CRUD for the jpool itself
// Get jpool (read)
export async function getJPool(req, res) {
	const jpool = await db.summon(db.jpool, req.params.jpoolId);
	res.status(200).json(jpool);
}

// Update jpool (update)
export async function updateJPool(req, res) {
	const jpool = await db.summon(db.jpool, req.params.jpoolId);
	const updates = req.body;
	delete updates.id;

	try {
		await jpool.update(updates);
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json(jpool);
}

// Delete jpool
export async function deleteJPool(req, res) {
	try {
		await db.jpool.destroy({
			where: { id: req.params.jpoolId },
		});
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}

	res.status(200).json({
		error: false,
		message: 'Judge pool deleted',
	});
}

// CRUD for the judges in the jpool.  Almost entirely consists of removing
// or creating jpool_judge relationships.

// Update a single judge.  Only POST and DELETE needed here.
// Add judge to jpool (create)
export async function createJPoolJudge(req, res) {
	try {
		await db.sequelize.query(
			`INSERT IGNORE into jpool_judge set (jpool, judge) values (:jpoolId, :judgeId)`,
			{
				replacements: {
					jpoolId: req.params.jpoolId,
					judgeId: req.params.judgeId,
				},
				type: db.sequelize.QueryTypes.INSERT,
			}
		);
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json({ error: false, message: 'Judge added to pool' });
}

// Remove judge from jpool
export async function deleteJPoolJudge(req, res) {
	await db.sequelize.query(
		`delete jpj.* from jpool_judge jpj where jpj.jpool = :jpoolId and jpj.judge = :judgeId`,
		{
			replacements: {
				jpoolId: req.params.jpoolId,
				judgeId: req.params.judgeId,
			},
			type: db.sequelize.QueryTypes.DELETE,
		}
	);
	res.status(200).json({ error: false, message: 'Judge removed from pool' });
}

// Update a bunch of judges
// Get judges in jpool (read)
export async function getJPoolJudges(req, res) {
	const judges = await db.sequelize.query(
		`select judge.* from judge, jpool_judge jpj where judge.id = jpj.judge and jpj.jpool = :jpoolId`,
		{
			replacements: { jpoolId: req.params.jpoolId },
			type: db.sequelize.QueryTypes.SELECT,
		}
	);
	res.status(200).json(judges);
}

// Add judges to jpool (create)
export async function createJPoolJudges(req, res) {
	let errs = '';
	for (const judgeId of req.body.judges) {
		try {
			await db.sequelize.query(
				`INSERT IGNORE into jpool_judge set (jpool, judge) values (:jpoolId, :judgeId)`,
				{
					replacements: {
						jpoolId: req.params.jpoolId,
						judgeId,
					},
					type: db.sequelize.QueryTypes.INSERT,
				}
			);
		} catch (err) {
			errs += err;
		}
	}
	if (errs) {
		return UnexpectedError(req, res, errs);
	}
	res.status(200).json('Judges added to pool');
}

// Remove all judges from jpool
export async function deleteJPoolJudges(req, res) {
	await db.sequelize.query(
		`delete jpj.* from jpool_judge jpj where jpj.jpool = :jpoolId`,
		{
			replacements: { jpoolId: req.params.jpoolId },
			type: db.sequelize.QueryTypes.DELETE,
		}
	);
	res.status(200).json('All judges removed from pool');
}

// CRUD for the rounds in the jpool.  Almost entirely consists of removing
// or creating jpool_round relationships.

// Update a single round.  Only POST and DELETE needed here.

// Add round to jpool (create)
export async function createJPoolRound(req, res) {
	try {
		await db.sequelize.query(
			`INSERT IGNORE into jpool_round set (jpool, round) values (:jpoolId, :roundId)`,
			{
				replacements: {
					jpoolId: req.params.jpoolId,
					roundId: req.params.roundId,
				},
				type: db.sequelize.QueryTypes.INSERT,
			}
		);
	} catch (err) {
		return UnexpectedError(req, res, err.message);
	}
	res.status(200).json('Round added to pool');
}

// Remove round from jpool
export async function deleteJPoolRound(req, res) {
	await db.sequelize.query(
		`delete jpr.* from jpool_round jpr where jpr.jpool = :jpoolId and jpr.round = :roundId`,
		{
			replacements: {
				jpoolId: req.params.jpoolId,
				roundId: req.params.roundId,
			},
			type: db.sequelize.QueryTypes.DELETE,
		}
	);
	res.status(200).json({ error: false, message: 'Round removed from pool' });
}

// Update a bunch of rounds

// Get rounds in jpool (read)
export async function getJPoolRounds(req, res) {
	const rounds = await db.sequelize.query(
		`select round.* from round, jpool_round jpr where round.id = jpr.round and jpr.jpool = :jpoolId`,
		{
			replacements: { jpoolId: req.params.jpoolId },
			type: db.sequelize.QueryTypes.SELECT,
		}
	);
	res.status(200).json(rounds);
}

// Add rounds to jpool (create)
export async function createJPoolRounds(req, res) {
	let errs = '';
	for (const roundId of req.body.rounds) {
		try {
			await db.sequelize.query(
				`INSERT IGNORE into jpool_round set (jpool, round) values (:jpoolId, :roundId)`,
				{
					replacements: {
						jpoolId: req.params.jpoolId,
						roundId,
					},
					type: db.sequelize.QueryTypes.INSERT,
				}
			);
		} catch (err) {
			errs += err;
		}
	}
	if (errs) {
		return UnexpectedError(req, res, errs);
	}
	res.status(200).json('Rounds added to pool');
}

// Remove all rounds from jpool
export async function deleteJPoolRounds(req, res) {
	await db.sequelize.query(
		`delete jpr.* from jpool_round jpr where jpr.jpool = :jpoolId`,
		{
			replacements: { jpoolId: req.params.jpoolId },
			type: db.sequelize.QueryTypes.DELETE,
		}
	);
	res.status(200).json('All rounds removed from pool');
}
