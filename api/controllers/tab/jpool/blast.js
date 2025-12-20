import { notify } from '../../../helpers/blast.js';
import { BadRequest, UnexpectedError } from '../../../helpers/problem.js';

export const blastJudges = {

	POST: async (req, res) => {

		if (!req.body.message) {
			return BadRequest(res, 'No message to blast sent');
		}

		const jpool = await req.db.summon(req.db.jpool, req.params.jpoolId);

		let query = '';

		if (req.body.free) {
			query = `
				select distinct person.id
					from (person, judge, jpool_judge jpj, jpool_round jpr, round)
				where round.timeslot = :timeslotId
					and round.id = jpr.round
					and jpr.jpool = jpj.jpool
					and round.site = :siteId
					and jpj.judge = judge.id
					and judge.person = person.id

				and NOT EXISTS (
						select b2.id
						from (ballot b2, panel p2, round r2)
						where r2.timeslot = round.timeslot
						and r2.id = p2.round
						and p2.id = b2.panel
						and b2.judge = judge.id
				)

				and not exists (
					select jpj.id
					from jpool_judge jpj
					where jpj.jpool = :jpoolId
					and jpj.judge = judge.id
				)
			`;

		} else {
			query = `
				select distinct person.id
					from (person, judge, jpool_judge jpj)
				where jpj.jpool = :jpoolId
					and jpj.judge = judge.id
					and judge.person = person.id
					and not exists (
						select ballot.id
							from ballot, panel, round, jpool_setting jps
						where ballot.judge = judge.id
							and ballot.panel = panel.id
							and panel.round = round.id
							and round.timeslot = jps.value
							and jps.tag = 'standby_timeslot'
							and jps.jpool = :jpoolId
					)
			`;
		}

		const jpoolJudgeIds = await req.db.sequelize.query(
			query, {
				replacements: {
					jpoolId    : req.params.jpoolId,
					timeslotId : jpool.settings.standby_timeslot,
					siteId     : jpool.site,
				},
				type: req.db.sequelize.QueryTypes.SELECT,
			}
		);

		const jpoolJudgeArray = [];

		jpoolJudgeIds.forEach( (jpj) => {
			jpoolJudgeArray.push(jpj.id);
		});

		const tourn = await req.db.summon(req.db.tourn, req.params.tournId);
		const seconds = Math.floor(Date.now() / 1000);
		const numberwang = seconds.toString().substring(-5);

		const from = `${tourn.name} <${tourn.webname}_${numberwang}@www.tabroom.com>`;
		const fromAddress = `<${tourn.webname}_${numberwang}@www.tabroom.com>`;

		const blastResponse = await notify({
			ids     : jpoolJudgeArray,
			text    : req.body.message,
			subject : req.body.subject || `Message to ${jpool.name} judges`,
			from,
			fromAddress,
		});

		const rawRounds = await req.db.sequelize.query(`
			select distinct round.id
				from round, jpool_round jpr
			where jpr.jpool = :jpoolId
				and jpr.round = round.id
		`, {
			replacements: { jpoolId: req.params.jpoolId },
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const promises = [];

		rawRounds.forEach( async (round) => {
			promises.push(req.db.changeLog.create({
				tag         : 'blast',
				description : `${req.body.message} sent to ${jpoolJudgeIds.length} judges in ${jpool.name}`,
				person      : req.session.person,
				round       : round.id,
			}));
		});

		await Promise.all(promises);

		if (blastResponse.error) {
			return UnexpectedError(res, blastResponse.message);
		}

		res.status(200).json(blastResponse);
	},
};

export default blastJudges;
