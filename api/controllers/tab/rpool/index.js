import { NotFound, UnexpectedError } from '../../../helpers/problem';

// General CRUD for the RPool itself
export const updateRPool = {

	GET: async (req, res) => {
		const rpool = await req.db.summon(req.db.rpool, req.params.rpoolId);
		return res.status(200).json(rpool);
	},

	POST: async (req, res) => {
		const rpool = await req.db.summon(req.db.rpool, req.params.rpoolId);
		const updates = req.body;
		delete updates.id;

		try {
			await rpool.update(updates);
		} catch (err) {
			return UnexpectedError(res, err.message);
		}
		return res.status(200).json(rpool);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.rpool.destroy({
				where: { id: req.params.rpoolId },
			});
		} catch (err) {
			return UnexpectedError(res, err.message);
		}

		return res.status(200).json({
			error: false,
			message: 'Room pool deleted',
		});
	},
};

// CRUD for the rooms in the rpool.  Almost entirely consists of removing
// or creating rpool_room relationships.

// Update a single room.  Only POST and DELETE needed here.
export const updateRPoolRoom = {
	POST: async (req, res) => {
		try {
			await req.db.sequelize.query(`
				INSERT IGNORE into rpool_room
					(rpool, room)
					values (:rpoolId, :roomId)
			`, {
				replacements : {
					rpoolId  : req.params.rpoolId,
					roomId   : req.params.roomId,
				},
				type: req.db.sequelize.QueryTypes.INSERT,
			});
		} catch (err) {
			return UnexpectedError(res, err.message);
		}

		return res.status(200).json({
			error   : false,
			message : 'Room added to pool',
		});
	},

	DELETE: async (req, res) => {
		await req.db.sequelize.query(`
			delete rpj.*
				from rpool_room rpj
				where rpj.rpool = :rpoolId
				and rpj.room = :roomId
		`, {
			replacements : {
				rpoolId  : req.params.rpoolId,
				roomId   : req.params.roomId,
			},
			type: req.db.sequelize.QueryTypes.DELETE,
		});

		return res.status(200).json({
			error: false,
			message: 'Room removed from pool',
		});
	},
};

// Update a bunch of rooms
export const updateRPoolRooms = {

	GET: async (req, res) => {
		const rooms = await req.db.sequelize.query(`
			select room.* from room, rpool_room rpj
				where room.id = rpj.room
				and rpj.rpool = :rpoolId
		`, {
			replacements: { rpoolId: req.params.rpoolId },
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		return res.status(200).json(rooms);
	},

	POST: async (req, res) => {

		let errs = '';

		req.body.rooms.forEach( async (roomId) => {
			try {
				await req.db.sequelize.query(`
					INSERT IGNORE into rpool_room
						(rpool, room)
						values (:rpoolId, :roomId)
				`, {
					replacements: {
						rpoolId: req.params.rpoolId,
						roomId,
					},
					type: req.db.sequelize.QueryTypes.INSERT,
				});

			} catch (err) {
				errs += err;
			}
		});

		if (errs) {
			return UnexpectedError(res, errs);
		}

		return res.status(200).json('Rooms added to pool');
	},

	DELETE: async (req, res) => {
		await req.db.sequelize.query(`
			delete rpj.* from rpool_room rpj where rpj.rpool = :rpoolId
		`, {
			replacements: { rpoolId: req.params.rpoolId },
			type: req.db.sequelize.QueryTypes.DELETE,
		});

		return res.status(200).json('All rooms removed from pool');
	},
};

// CRUD for the rounds in the rpool.  Almost entirely consists of removing
// or creating rpool_round relationships.

// Update a single round.  Only POST and DELETE needed here.

export const updateRPoolRound = {
	POST: async (req, res) => {
		try {
			await req.db.sequelize.query(`
				INSERT IGNORE into rpool_round
					(rpool, round)
					values (:rpoolId, :roundId)
			`, {
				replacements: {
					rpoolId: req.params.rpoolId,
					roundId: req.params.roundId,
				},
				type: req.db.sequelize.QueryTypes.INSERT,
			});
		} catch (err) {
			return UnexpectedError(res, err.message);
		}

		return res.status(200).json('Round added to pool');
	},

	DELETE: async (req, res) => {
		await req.db.sequelize.query(`
			delete rpr.*
				from rpool_round rpr
				where rpr.rpool = :rpoolId
				and rpr.round = :roundId
		`, {
			replacements: {
				rpoolId: req.params.rpoolId,
				roundId: req.params.roundId,
			},
			type: req.db.sequelize.QueryTypes.DELETE,
		});

		return res.status(200).json({
			error: false,
			message: 'Round removed from pool',
		});
	},
};

// Update a bunch of rounds

export const updateRPoolRounds = {

	GET: async (req, res) => {
		const rounds = await req.db.sequelize.query(`
			select round.* from round, rpool_round rpr
			where round.id = rpr.round
				and rpr.rpool = :rpoolId
		`, {
			replacements : { rpoolId : req.params.rpoolId },
			type         : req.db.sequelize.QueryTypes.SELECT,
		});

		return res.status(200).json(rounds);
	},

	POST: async (req, res) => {

		let errs = '';
		let reply = '';

		if (req.body.property_value) {

			const rounds = await req.db.sequelize.query(`
				select round.id, round.label, round.name, event.abbr
				from round, event
				where round.id = :roundId
				and round.event = event.id
			`, {
				replacements: { roundId: req.body.property_value },
				type: req.db.Sequelize.QueryTypes.SELECT,
			});

			if (!rounds || rounds.length < 1) {
				return NotFound(res,`No round found with ID ${req.body.property_value}`);
			}

			const round = rounds.shift();

			try {
				await req.db.sequelize.query(`
					INSERT IGNORE into rpool_round
						(rpool, round)
						values (:rpoolId, :roundId)
				`, {
					replacements: {
						rpoolId: req.params.rpoolId,
						roundId: parseInt(req.body.property_value),
					},
					type: req.db.sequelize.QueryTypes.INSERT,
				});

			} catch (err) {
				errs += err;
			}

			// oh for the day when I have a real framework running and no longer
			// have to do this
			reply                 = `
				<span class       = "quarter nospace">
				<a value          = "1"
					id            = "${round.id}_${req.params.rpoolId}"
					property_name = "delete"
					round_id      = "${round.id}"
					rpool_id      = "${req.params.rpoolId}"
					on_success    = "destroy"
					onclick       = "postSwitch(this, 'rpool_round_rm.mhtml'); fixVisual();"
					class         = "full white nowrap hover marno smallish"
					title         = "Remove this round"
				>${round.abbr} ${round.name}</a>
				</span>
			`;

		} else if (req.body.rounds) {

			req.body.rounds.forEach( async (roundId) => {
				try {
					await req.db.sequelize.query(`
						INSERT IGNORE into rpool_round
							(rpool, round)
							values (:rpoolId, :roundId)
					`, {
						replacements: {
							rpoolId: req.params.rpoolId,
							roundId,
						},
						type: req.db.sequelize.QueryTypes.INSERT,
					});

				} catch (err) {
					errs += err;
				}
			});
		}

		if (errs) {
			return UnexpectedError(res, errs);
		}

		if (reply) {
			return res.status(200).json({
				error        : false,
				message      : 'Rounds added to pool',
				reply_append : `${req.params.rpoolId}_rounds`,
				reply,
			});
		}

		return res.status(200).json('Rounds added to pool');
	},

	DELETE: async (req, res) => {
		await req.db.sequelize.query(`
			delete
				rpr.*
			from rpool_round rpr
			where rpr.rpool = :rpoolId
		`, {
			replacements: { rpoolId: req.params.rpoolId },
			type: req.db.sequelize.QueryTypes.DELETE,
		});

		res.status(200).json('All rounds removed from pool');
	},
};

export default updateRPool;
