// import { showDateTime } from '../../../helpers/common';

import { UnexpectedError } from '../../../helpers/problem';

// General CRUD for the jpool itself
export const updateJPool = {

	GET: async (req, res) => {
		const jpool = await req.db.summon(req.db.jpool, req.params.jpoolId);
		res.status(200).json(jpool);
	},

	POST: async (req, res) => {
		const jpool = await req.db.summon(req.db.jpool, req.params.jpoolId);
		const updates = req.body;
		delete updates.id;

		try {
			await jpool.update(updates);
		} catch (err) {
			return UnexpectedError(req, res, err.message);
		}
		res.status(200).json(jpool);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.jpool.destroy({
				where: { id: req.params.jpoolId },
			});
		} catch (err) {
			return UnexpectedError(req, res, err.message);
		}

		res.status(200).json({
			error: false,
			message: 'Judge pool deleted',
		});
	},
};

// CRUD for the judges in the jpool.  Almost entirely consists of removing
// or creating jpool_judge relationships.

// Update a single judge.  Only POST and DELETE needed here.
export const updateJPoolJudge = {
	POST: async (req, res) => {
		try {
			await req.db.sequelize.query(`
				INSERT IGNORE into jpool_judge
					set (jpool, judge)
					values (:jpoolId, :judgeId)
			`, {
				replacements: {
					jpoolId: req.params.jpoolId,
					judgeId: req.params.judgeId,
				},
				type: req.db.sequelize.QueryTypes.INSERT,
			});
		} catch (err) {
			return UnexpectedError(req, res, err.message);
		}

		res.status(200).json({
			error   : false,
			message : 'Judge added to pool',
		});
	},

	DELETE: async (req, res) => {
		await req.db.sequelize.query(`
			delete jpj.*
				from jpool_judge jpj
				where jpj.jpool = :jpoolId
				and jpj.judge = :judgeId
		`, {
			replacements: {
				jpoolId: req.params.jpoolId,
				judgeId: req.params.judgeId,
			},
			type: req.db.sequelize.QueryTypes.DELETE,
		});

		res.status(200).json({
			error: false,
			message: 'Judge removed from pool',
		});
	},
};

// Update a bunch of judges
export const updateJPoolJudges = {

	GET: async (req, res) => {
		const judges = await req.db.sequelize.query(`
			select judge.* from judge, jpool_judge jpj
				where judge.id = jpj.judge
				and jpj.jpool = :jpoolId
		`, {
			replacements: { jpoolId: req.params.jpoolId },
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(judges);
	},

	POST: async (req, res) => {

		let errs = '';

		req.body.judges.forEach( async (judgeId) => {
			try {
				await req.db.sequelize.query(`
					INSERT IGNORE into jpool_judge
						set (jpool, judge)
						values (:jpoolId, :judgeId)
				`, {
					replacements: {
						jpoolId: req.params.jpoolId,
						judgeId,
					},
					type: req.db.sequelize.QueryTypes.INSERT,
				});

			} catch (err) {
				errs += err;
			}
		});

		if (errs) {
			return UnexpectedError(req, res, errs);
		}

		res.status(200).json('Judges added to pool');
	},

	DELETE: async (req, res) => {
		await req.db.sequelize.query(`
			delete jpj.* from jpool_judge jpj where jpj.jpool = :jpoolId
		`, {
			replacements: { jpoolId: req.params.jpoolId },
			type: req.db.sequelize.QueryTypes.DELETE,
		});

		res.status(200).json('All judges removed from pool');
	},
};

// CRUD for the rounds in the jpool.  Almost entirely consists of removing
// or creating jpool_round relationships.

// Update a single round.  Only POST and DELETE needed here.

export const updateJPoolRound = {
	POST: async (req, res) => {
		try {
			await req.db.sequelize.query(`
				INSERT IGNORE into jpool_round
					set (jpool, round)
					values (:jpoolId, :roundId)
			`, {
				replacements: {
					jpoolId: req.params.jpoolId,
					roundId: req.params.roundId,
				},
				type: req.db.sequelize.QueryTypes.INSERT,
			});
		} catch (err) {
			return UnexpectedError(req, res, err.message);
		}

		res.status(200).json('Round added to pool');
	},

	DELETE: async (req, res) => {
		await req.db.sequelize.query(`
			delete jpr.*
				from jpool_round jpr
				where jpr.jpool = :jpoolId
				and jpr.round = :roundId
		`, {
			replacements: {
				jpoolId: req.params.jpoolId,
				roundId: req.params.roundId,
			},
			type: req.db.sequelize.QueryTypes.DELETE,
		});

		res.status(200).json({
			error: false,
			message: 'Round removed from pool',
		});
	},
};

// Update a bunch of rounds

export const updateJPoolRounds = {

	GET: async (req, res) => {
		const rounds = await req.db.sequelize.query(`
			select round.* from round, jpool_round jpr
				where round.id = jpr.round
				and jpr.jpool = :jpoolId
		`, {
			replacements: { jpoolId: req.params.jpoolId },
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		res.status(200).json(rounds);
	},

	POST: async (req, res) => {
		let errs = '';
		req.body.rounds.forEach( async (roundId) => {
			try {
				await req.db.sequelize.query(`
					INSERT IGNORE into jpool_round
						set (jpool, round)
						values (:jpoolId, :roundId)
				`, {
					replacements: {
						jpoolId: req.params.jpoolId,
						roundId,
					},
					type: req.db.sequelize.QueryTypes.INSERT,
				});

			} catch (err) {
				errs += err;
			}
		});

		if (errs) {
			return UnexpectedError(req, res, errs);
		}

		res.status(200).json('Rounds added to pool');
	},

	DELETE: async (req, res) => {
		await req.db.sequelize.query(`
			delete jpr.* from jpool_round jpr where jpr.jpool = :jpoolId
		`, {
			replacements: { jpoolId: req.params.jpoolId },
			type: req.db.sequelize.QueryTypes.DELETE,
		});

		res.status(200).json('All rounds removed from pool');
	},
};

export default updateJPool;
