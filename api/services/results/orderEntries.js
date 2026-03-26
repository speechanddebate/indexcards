/* This service calculates the entries in order of the tiebreakers of a given
 * round ID, which INCLUDES the results from that round, if any. */

/* This service is for tournament admins only and cannot be exposed to the
 * public interfaces */

import db from '../../data/db.js';

export const entriesInOrder = async (roundId) => {

	const resultsData = await db.sequelize.query(`
		select
			entry.id, entry.code,
			round.id roundId, round.type roundType, round.name roundName,
			panel.bye panelBye,
			ballot.bye, ballot.forfeit, ballot.chair,
			score.id scoreId, score.tag scoreTag, score.value scoreValue,
			student.id studentId, student.last studentLast
		from (entry, round sample, round, panel, ballot)
			left join score
				on score.ballot = ballot.id
				and score.tag IN ('rank', 'winloss', 'point', 'refute', 'po')
		where 1=1
			and sample.id = :roundId
			and sample.event = round.event
			and sample.name >= round.name
			and round.id = panel.round
			and panel.id = ballot.panel
			and ballot.entry = entry.id
			and NOT EXISTS (
				select rs.id from round_setting rs
				where rs.tag = 'ignore_results'
				and rs.round = round.id
			)
	`, {
		type: db.Sequelize.QueryTypes.SELECT,
		replacements: { roundId },
	});

	return resultsData;

};

export default {
	entriesInOrder,
};