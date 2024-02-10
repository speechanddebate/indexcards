import { roundCheck } from '../../../helpers/auth.js';

// This function needs to be adapted to the new permissions model to enable it
// to ONLY merge and unmerge the rounds that a given user has access to under
// the events/category restrictions.  Also the frontend needs to change to allow
// it to be invoked; the URL is definitely now broken.

// Merges and unmerges all the rounds in a given timeslot and judge category
// for unified judge placement.  This method should be more robust than the
// stash & store method.

export const mergeTimeslotRounds = {

	POST: async (req, res) => {

		const db = req.db;
		const roundId = req.params.roundId;

		const permOK = await roundCheck(req, res, roundId);
		if (!permOK) {
			res.status(200).json({
				error   : true,
				message : `You do not have permission to merge those rounds`,
			});
		}

		try {
			await db.sequelize.query(`
				update
					panel, round, round r2, event, event e2
				set panel.round = round.id
				where round.id = :roundId
					and panel.round = r2.id
					and r2.timeslot = round.timeslot
					and round.event = event.id
					and r2.event = e2.id
					and e2.category = event.category
			`, {
				replacements : { roundId },
				type         : db.sequelize.QueryTypes.UPDATE,
			});

		} catch (err) {

			res.status(200).json({
				error   : true,
				message : `Error occurred on merge: ${err}`,
			});
		}

		try {
			await db.sequelize.query(`
				insert into round_setting
				(round, tag, value)
				values (:roundId, 'timeslot_merge', 1)
			`, {
				replacements : { roundId },
				type         : db.sequelize.QueryTypes.INSERT,
			});
		} finally {

			res.status(200).json({
				refresh : true,
				error   : false,
				message : `All rounds in this judge category have been merged to this one for judge placement.`,
			});
		}
	},

};

export const unmergeTimeslotRounds = {
	POST: async (req, res) => {
		const db = req.db;
		const roundId = req.params.roundId;

		const permOK = await roundCheck(req, res, roundId);
		if (!permOK) {
			res.status(200).json({
				error   : true,
				message : `You do not have permission to merge those rounds`,
			});
		}

		try {
			await db.sequelize.query(`
				update
					panel, ballot, entry, event, round, round current
				set panel.round = round.id
				where panel.round = :roundId
					and panel.id = ballot.panel
					and ballot.entry = entry.id
					and entry.event = event.id
					and event.id = round.event
					and panel.round = current.id
					and current.timeslot = round.timeslot
			`, {
				replacements : { roundId },
				type         : db.sequelize.QueryTypes.UPDATE,
			});

		} catch (err) {

			res.status(200).json({
				error   : true,
				message : `Error occurred on merge: ${err}`,
			});
		}

		try {
			await db.sequelize.query(`
				delete * from round_setting
				(round, tag, value)
				values (:roundId, 'timeslot_merge', 1)
			`, {
				replacements : { roundId },
				type         : db.sequelize.QueryTypes.DELETE,
			});
		} finally {
			res.status(200).json({
				refresh : true,
				error   : false,
				message : `All rounds have been restored to their original event.`,
			});
		}
	},
};

export default mergeTimeslotRounds;
