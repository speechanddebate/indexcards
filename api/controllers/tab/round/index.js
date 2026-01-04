import { addZero } from '../../../helpers/text.js';

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

		await round.update(updates);
		res.status(200).json(round);
	},

	DELETE: async (req, res) => {

		await req.db.round.destroy({
			where: { id: req.params.roundId },
		});

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
				SUBSTRING(neg_label.value, 1, 1) neg,
				event.type eventType
			from (round, event)

				left join event_setting aff_label
					on aff_label.event = event.id
					and aff_label.tag = 'aff_label'

				left join event_setting neg_label
					on neg_label.event = event.id
					and neg_label.tag = 'neg_label'

			where round.id = :roundId
				and round.event = event.id
				and event.id = neg_label.event
		`, {
			replacements: { roundId: req.params.roundId },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		const tmplabel = labels.shift();

		const label = {
			1: tmplabel?.aff || 'A',
			2: tmplabel?.neg || 'N',
		};

		const eventType = tmplabel.eventType || 'debate';

		const rawBallots = await db.sequelize.query(`
			select
				ballot.id ballot,
				panel.id panel,
				judge.id judge, judge.last judgeLast,
				ballot.chair,
				CONVERT_TZ(ballot.judge_started, '+00:00', tourn.tz) startTime,
				ballot.audit,
				ballot.side,
				ballot.bye, ballot.forfeit, panel.bye pbye,
				rank.id rank,
				point.id point,
				winloss.id winloss,
				winloss.value winner,
				rubric.id rubric_id,
				panel.flight,
				rubric.content rubric

			from (ballot, panel, round, event, tourn)

				left join judge on ballot.judge           = judge.id
				left join score rank on rank.ballot       = ballot.id and rank.tag    = 'rank'
				left join score point on point.ballot     = ballot.id and point.tag   = 'point'
				left join score winloss on winloss.ballot = ballot.id and winloss.tag = 'winloss'
				left join score rubric on rubric.ballot   = ballot.id and rubric.tag  = 'rubric'

			where round.id = :roundId
				and panel.round = round.id
				and panel.id = ballot.panel
				and round.event = event.id
				and event.tourn = tourn.id
			order by ballot.side
		`, {
			replacements: { roundId: req.params.roundId },
			type         : db.sequelize.QueryTypes.SELECT,
		});

		const round = {
			judges    : {},
			out       : {},
			panels    : {},
			byePanels : {},
		};

		const done = [];

		for (const ballot of rawBallots) {

			if (ballot.rubric) {
				ballot.rubricCount = 0;
				const rubric = JSON.parse(ballot.rubric);
				for (const rowCount of Object.keys(rubric)) {
					if ( parseInt(rubric[rowCount].points) > 0) {
						ballot.rubricCount++;
					}
				}
			}

			if (!ballot.judge && !ballot.pbye) {

				round.panels[ballot.panel] = round.panels[ballot.panel] || 0;
				let already = round.byePanels[ballot.panel] || '';

				if (already) {
					already += `<br />`;
				}

				if (ballot.audit) {

					if (ballot.forfeit) {
						already += `${label[ballot.side]} Fft`;
					} else if (ballot.bye) {
						already += `${label[ballot.side]} Bye`;
					} else {
						already += `${label[ballot.side]} NONE`;
					}

					round.panels[ballot.panel] = 9000;

				} else if (
					eventType !== 'speech'
					&& eventType !== 'congress'
				) {

					if (ballot.bye) {
						already += ` &frac12; BYE`;
						round.panels[ballot.panel] += 10;
					} else if (ballot.forfeit) {
						already += ` &frac12; FFT`;
						round.panels[ballot.panel] += 10;
					}
				}

				round.byePanels[ballot.panel] = already;

				continue;
			}

			if (!round.judges[ballot.judge]) {
				round.judges[ballot.judge] = {};
			}

			if (!round.judges[ballot.judge][ballot.panel]) {
				round.judges[ballot.judge][ballot.panel] = { panel: ballot.panel };
			}

			if (!round.panels[ballot.panel]) {
				round.panels[ballot.panel] = 0;
			}

			const judge = round.judges[ballot.judge][ballot.panel];

			if (!round.out[ballot.flight]) {
				round.out[ballot.flight] = {};
			}

			if (!judge.text) {
				judge.text = '';
			}

			if (ballot.audit) {

				round.panels[ballot.panel] += 100;

				if (ballot.winloss) {
					if (ballot.winner) {
						judge.text = label[ballot.side];
						judge.class = 'greentext semibold';
					}
				} else if (
					eventType !== 'speech'
					&& eventType !== 'congress'
					&& ballot.pbye
				) {
					judge.text = 'BYE';
					judge.class = 'graytext semibold';
				} else if (
					eventType !== 'speech'
					&& eventType !== 'congress'
					&& ballot.bye
				) {
					if (!done[ballot.ballot]) {
						if (judge.text) {
							judge.text += `/`;
						}
						round.panels[ballot.panel] = 10000;
						judge.text += `Bye`;
						done[ballot.ballot] = true;
					}
					judge.class = 'graytext semibold';
				} else if (
					eventType !== 'speech'
					&& eventType !== 'congress'
					&& ballot.forfeit
				) {
					if (!done[ballot.ballot]) {
						if (judge.text) {
							judge.text += `/`;
						}
						judge.text += `Fft`;
						done[ballot.ballot] = true;
					}
					judge.class = 'graytext semibold';
				} else if (ballot.rank) {
					judge.text = 'in';
					judge.class = 'greentext semibold';
				} else if (ballot.chair) {
					judge.class = 'fa fa-sm fa-star greentext';
				}

			} else if (
				eventType !== 'speech'
				&& eventType !== 'congress'
				&& ballot.pbye
			) {
				round.panels[ballot.panel] = 10000;
				judge.text = 'BYE';
			} else if (ballot.winloss || ballot.rank || ballot.point) {
				round.out[ballot.flight][ballot.judge] = true;
				round.panels[ballot.panel] += 100;
				judge.text = '&frac12;';
				judge.class = 'redtext';
			} else if (ballot.rubricCount || judge.count) {
				round.out[ballot.flight][ballot.judge] = true;
				if (typeof ballot.rubricCount === 'number') {
					if (!judge.count) {
						judge.count = 0;
					}
					judge.count += ballot.rubricCount;
					judge.class = 'bluetext italic';
				}
			} else if (ballot.startTime) {
				round.out[ballot.flight][ballot.judge] = true;
				round.panels[ballot.panel] += 10;
				const started = new Date(ballot.startTime);
				const decimals = parseFloat(`.${started.getUTCHours()}${addZero(started.getUTCMinutes())}`);
				round.panels[ballot.panel] += decimals;
				judge.text = `${started.getUTCHours()}:${addZero(started.getUTCMinutes())}`;
			} else {
				round.out[ballot.flight][ballot.judge] = true;
				delete round.judges[ballot.judge][ballot.panel];
				round.panels[ballot.panel] += 1;
			}
		}

		for (const ballot of rawBallots) {
			if (ballot?.judge && ballot?.panel) {
				const judge = round.judges[ballot.judge][ballot.panel];

				if (judge &&
					judge.count
					&& (!ballot.winloss && !ballot.rank && !ballot.point)
				) {
					judge.text = judge.count.toString();
				}
			}
		}

		res.status(200).json(round);
	},
};

export default updateRound;
