import { notify } from '../../../helpers/blast';

export const blastJudges = {

	GET: async (req, res) => {
		res.status(400).json('Please use a POST request to send a blast');
	},

	POST: async (req, res) => {

		if (!req.body.message) {
			res.status(401).json('No message to blast sent');
		}

		const jpool = req.db.summon(req.db.jpool, req.params.jpoolId);

		let queryLimit = '';

		if (req.body.free) {
			queryLimit = `
				and not exists (
					select ballot.id
						from ballot, panel, round, jpool_setting jps
					where ballot.judge = judge.id
						and ballot.panel = panel.id
						and panel.round = round.id
						and round.timestamp = jps.value
						and jps.tag = 'standby'
						and jps.jpool = jpool.id
				)
			`;
		}

		const jpoolJudgeIds = await req.db.sequelize.query(`
			select distinct person.id
				from person, judge, jpool_judge jpj
			where jpj.jpool = :jpoolId
				and jpj.judge = judge.id
				and judge.person = person.id
				${queryLimit}
		`, {
			replacements: { jpoolId : req.params.jpoolId },
			type: req.db.sequelize.QueryTypes.SELECT,
		});

		const jpoolJudgeArray = [];

		jpoolJudgeIds.forEach( (jpj) => {
			jpoolJudgeArray.push(jpj.id);
		});

		const blastResponse = notify({
			ids  : jpoolJudgeArray,
			text : req.body.message,
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

		rawRounds.forEach( async (round) => {
			await req.db.changeLog.create({
				tag         : 'blast',
				description : `${req.body.message} sent to ${jpoolJudgeIds.length} judges in ${jpool.name}`,
				person      : req.session.person,
				round       : round.id,
			});
		});

		if (blastResponse.error) {
			res.status(401).json(blastResponse.message);
		}

		res.status(200).json(blastResponse);
	},
};

export default blastJudges;
