import db from '../../data/db.js';
/**
 * Returns a judging record of a particular person
 * @param {*} personId the person to get the record for
 */
export async function judgeRecord(personId){
	const sql = `
		select ballot.id as ballot_id,
						ballot.side as ballot_side,
						event.abbr as event_abbr,
						win.value as vote_win,
						panel.id as panel_id,
						entry.code as entry_code,
						tourn.name as tourn_name,
						tourn.start as round_date,
						round.label as round_label,
						round.name as round_name,
						aff_label.value as aff_label,
						neg_label.value as neg_label,
						(
							select count(aff_ballot.id)
							from ballot aff_ballot
							where 1=1
							and aff_ballot.side = 1
							and aff_ballot.panel = panel.id
							and exists (
								select aff_score.id
									from score aff_score
								where aff_score.ballot  = aff_ballot.id
									and aff_score.tag   = 'winloss'
									and aff_score.value = 1
							)
						) as aff_wins,
						(
							select count(neg_ballot.id)
							from ballot neg_ballot
							where 1=1
							and neg_ballot.side = 2
							and neg_ballot.panel = panel.id
							and exists (
								select aff_score.id
									from score aff_score
								where aff_score.ballot  = neg_ballot.id
									and aff_score.tag   = 'winloss'
									and aff_score.value = 1
							)
						) as neg_wins

					from (ballot, judge, panel, round, event, entry, tourn)

						left join school on entry.school = school.id

						left join chapter on chapter.id = school.chapter

						 left join score win
							 on win.ballot = ballot.id
							 and win.tag = 'winloss'

						left join event_setting aff_label
							on aff_label.tag = 'aff_label'
							and aff_label.event = event.id

						left join event_setting neg_label
							on neg_label.tag = 'neg_label'
							and neg_label.event = event.id

					where ballot.judge         = judge.id
						and judge.person       = :personId
						and panel.id           = ballot.panel
						and round.id           = panel.round
						and round.event        = event.id
						and ballot.entry       = entry.id
						and tourn.id           = event.tourn
						and round.post_primary = 3
						and tourn.hidden != 1
						and round.published > 0

						and exists (
							select score.id
								from score
							where score.ballot = ballot.id
								and score.tag      = 'winloss'
						)

					group by ballot.id
					order by
						tourn.start desc,
						round.name,
						ballot.panel asc;
		`;

	const rows = await db.sequelize.query(sql, {
		replacements: { personId },
		type: db.Sequelize.QueryTypes.SELECT,
	});

	const groupedByPanel = new Map();

	for (const row of rows) {
		const panelId = row.panel_id;
		if (!groupedByPanel.has(panelId)) {
			const affLabel = row.aff_label || 'Aff';
			const negLabel = row.neg_label || 'Neg';
			const affWins = Number(row.aff_wins) || 0;
			const negWins = Number(row.neg_wins) || 0;

			let panelVote = '';
			if (affWins > negWins) {
				panelVote = affLabel;
			} else if (negWins > affWins) {
				panelVote = negLabel;
			} else {
				panelVote = 'Tie';
			}

			let roundDate = '';
			if (row.round_date) {
				const parsed = new Date(row.round_date);
				roundDate = Number.isNaN(parsed.getTime()) ? String(row.round_date) : parsed.toISOString();
			}

			groupedByPanel.set(panelId, {
				tournName: row.tourn_name || '',
				roundDate,
				roundLabel: row.round_label || (row.round_name ? `R${row.round_name}` : ''),
				eventAbbr: row.event_abbr || '',
				affTeam: '',
				affLabel,
				negTeam: '',
				negLabel,
				vote: '',
				panelVote,
				record: `${affWins}-${negWins}`,
			});
		}

		const record = groupedByPanel.get(panelId);
		const side = Number(row.ballot_side);
		if (side === 1) {
			record.affTeam = row.entry_code || '';
			if (Number(row.vote_win) === 1) {
				record.vote = record.affLabel;
			}
		}
		if (side === 2) {
			record.negTeam = row.entry_code || '';
			if (Number(row.vote_win) === 1) {
				record.vote = record.negLabel;
			}
		}
	}

	return Array.from(groupedByPanel.values());
}