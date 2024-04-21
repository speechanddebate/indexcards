import { addZero } from '../../../helpers/text';

// General CRUD for the round itself
export const updateRound = {

	GET: async (req, res) => {
		const round = await req.db.summon(req.db.round, req.params.roundId);
		res.status(200).json(round);
	},

	POST: async (req, res) => {
		const round = await req.db.summon(req.db.round, req.params.roundId);
		const updates = req.body;
		delete updates.id;

		try {
			await round.update(updates);
		} catch (err) {
			res.status(400).json({
				error: true,
				message: err,
			});
		}
		res.status(200).json(round);
	},

	DELETE: async (req, res) => {
		try {
			await req.db.round.destroy({
				where: { id: req.params.roundId },
			});
		} catch (err) {
			res.status(401).json(err);
		}

		res.status(200).json({
			error: false,
			message: 'Round deleted',
		});
	},
};

export const sideCounts = {
	GET: async (req, res) => {

		const sideResults = await req.db.sequelize.query(`
			select
				ballot.judge, ballot.side,
				aff_label.value aff,
				neg_label.value neg

			from (panel, ballot, round)

				left join event_setting aff_label
					on aff_label.event = round.event
					and aff_label.tag = 'aff_label'

				left join event_setting neg_label
					on neg_label.event = round.event
					and neg_label.tag = 'neg_label'

			where round.id = :roundId
				and round.id = panel.round
				and panel.id = ballot.panel
				and ballot.bye != 1
				and ballot.forfeit != 1
				and panel.bye != 1
				and exists (
					select score.id
					from score
					where score.ballot = ballot.id
					and score.tag = 'winloss'
					and score.value = 1
				)
			group by ballot.judge
			order by ballot.side
		`, {
			replacements : { roundId: req.params.roundId },
			type         : req.db.sequelize.QueryTypes.SELECT,
		});

		const sideCounter = {};

		for (const result of sideResults) {

			result.aff = result.aff || 'Aff';
			result.neg = result.neg || 'Neg';

			if (result.side === 1) {
				if (!sideCounter[result.aff]) {
					sideCounter[result.aff] = 1;
				} else {
					sideCounter[result.aff]++;
				}
			} else if (result.side === 2) {
				if (!sideCounter[result.neg]) {
					sideCounter[result.neg] = 1;
				} else {
					sideCounter[result.neg]++;
				}
			}
		}
		res.status(200).json(sideCounter);
	},
};

export const roundDecisionStatus = {

	GET: async (req, res) => {
		const db = req.db;

		const labels = await db.sequelize.query(`
			select
				SUBSTRING(aff_label.value, 1, 1) aff,
				SUBSTRING(neg_label.value, 1, 1) neg
			from event_setting aff_label, event_setting neg_label, round

			where round.id = :roundId
				and round.event = aff_label.event
				and round.event = neg_label.event
				and aff_label.tag = 'aff_label'
				and neg_label.tag = 'neg_label'
		`, {
			replacements: { roundId: req.params.roundId },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		const tmplabel = labels.shift();

		const label = {
			1: tmplabel?.aff || 'A',
			2: tmplabel?.neg || 'N',
		};

		const rawBallots = await db.sequelize.query(`
			select
				ballot.id ballot,
				panel.id panel,
				judge.id judge,
				ballot.chair,
				CONVERT_TZ(ballot.judge_started, '+00:00', tourn.tz) startTime,
				ballot.audit,
				ballot.side,
				ballot.bye, ballot.forfeit, panel.bye pbye,
				rank.id rank,
				point.id point,
				winloss.id winloss,
				winloss.value winner,
				rubric.id rubric,
				panel.flight

			from (judge, ballot, panel, round, event, tourn)
				left join score rank on rank.ballot = ballot.id and rank.tag = 'rank'
				left join score point on point.ballot = ballot.id and point.tag = 'point'
				left join score winloss on winloss.ballot = ballot.id and winloss.tag = 'winloss'
				left join score rubric on rubric.ballot = ballot.id and rubric.tag = 'rubric'

			where round.id = :roundId
				and panel.round = round.id
				and panel.id = ballot.panel
				and ballot.judge = judge.id
				and round.event = event.id
				and event.tourn = tourn.id
		`, {
			replacements: { roundId: req.params.roundId },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		const round = {
			judges : {},
			out    : {},
			panels : {},
		};

		rawBallots.forEach( (ballot) => {

			if (!round.judges[ballot.judge]) {
				round.judges[ballot.judge] = {};
			}
			if (!round.judges[ballot.judge][ballot.flight]) {
				round.judges[ballot.judge][ballot.flight] = { panel: ballot.panel };
			}

			if (!round.panels[ballot.panel]) {
				round.panels[ballot.panel] = 0;
			}

			const judge = round.judges[ballot.judge][ballot.flight];

			if (!round.out[ballot.flight]) {
				round.out[ballot.flight] = {};
			}

			if (ballot.audit) {

				if (!judge.text) {
					judge.text = '';
				}

				round.panels[ballot.panel] += 10000;

				if (ballot.winloss) {
					if (ballot.winner) {
						judge.text = label[ballot.side];
						judge.class = 'greentext semibold';
					}
				} else if (ballot.pbye) {
					judge.text = 'BYE';
					judge.class = 'graytext semibold';
				} else if (ballot.bye) {
					if (judge.text) {
						judge.text += `/`;
					}
					judge.text += `Bye`;
					judge.class = 'graytext semibold';
				} else if (ballot.forfeit) {
					if (judge.text) {
						judge.text += `/`;
					}
					judge.text += `Fft`;
					judge.class = 'graytext semibold';
				} else if (ballot.rank) {
					judge.text = 'in';
					judge.class = 'greentext semibold';
				} else if (ballot.chair) {
					judge.class = 'fa fa-sm fa-star greentext';
				}
			} else if (ballot.pbye) {
				round.panels[ballot.panel] += 1000;
				judge.text = 'BYE';
			} else if (ballot.winloss || ballot.rank || ballot.point || ballot.rubric ) {
				round.out[ballot.flight][ballot.judge] = true;
				round.panels[ballot.panel] += 100;
				judge.text = '&frac12;';
				judge.class = 'redtext';
			} else if (ballot.startTime) {
				round.out[ballot.flight][ballot.judge] = true;
				round.panels[ballot.panel] += 10;
				const started = new Date(ballot.startTime);
				judge.text = `${started.getUTCHours()}:${addZero(started.getUTCMinutes())}`;
			} else {
				round.out[ballot.flight][ballot.judge] = true;
				delete round.judges[ballot.judge][ballot.flight];
				round.panels[ballot.panel] += 1;
			}
		});

		res.status(200).json(round);
	},
};

export default updateRound;
