import { checkJudgePerson } from '../../../helpers/auth.js';
import { errorLogger } from '../../../helpers/logger.js';
import db from '../../../data/db.js';

export async function checkActive(req, res) {
	const judgeId = parseInt(req.params.judgeId);

	const judges = await db.sequelize.query(`
		select
		judge.active, judge.id, judge.person
		from judge
		where judge.id = :judgeId
	`, {
		replacements: {
			judgeId,
		},
		type : db.Sequelize.QueryTypes.SELECT,
	});

	if (judges && judges[0].person === req.session.person) {
		return (judges[0].active);
	}
};

export async function checkBallotAccess (req, res) {
	const judgeId = parseInt(req.params.judgeId);
	const sectionId = parseInt(req.params.sectionId);

	const access = await db.sequelize.query(`
		select
			ballot.id, ballot.audit, judge.person
			from ballot, judge
		where ballot.judge = :judgeId
			and ballot.panel = :sectionId
			and ballot.judge = judge.id
	`, {
		replacements: {
			sectionId,
			judgeId,
		},
		type : db.Sequelize.QueryTypes.SELECT,
	});

	if (access && access.length > 0) {

		let ok = false;
		let stop = 0;

		for (const ballot of access) {
			if (stop < 1) {
				if (!req.session?.person
					|| (ballot.person !== req.session.person && !req.person.siteAdmin)
				) {
					stop++;
					return res.status(200).json({
						error   : false,
						message : `Your Tabroom account is not linked to that judge!`,
						refresh : true,
					});
				}

				if (!ballot.audit) {
					ok = true;
				}
			}
		}

		if (ok) {
			return res.status(200).json({
				refresh: false,
			});
		}

		return res.status(200).json({
			error   : false,
			message : `Your ballot has already been marked confirmed.`,
			refresh : true,
		});

	}

	return res.status(200).json({
		error   : false,
		message : `You no longer have access to this ballot.  Check on Tabroom or with tournament staff to see whether you have been reassigned.`,
		refresh : true,
	});
};

export async function getBallotSides(req, res) {
	const judgeId = parseInt(req.params.judgeId);
	const sectionId = parseInt(req.params.sectionId);

	const ballots = await db.sequelize.query(`
		select
			ballot.id, ballot.entry, ballot.side
		from ballot
		where ballot.judge = :judgeId
			and ballot.panel = :sectionId
	`, {
		replacements: {
			sectionId,
			judgeId,
		},
		type : db.Sequelize.QueryTypes.SELECT,
	});

	const ballotData = {
		affBallot: 0,
		negBallot: 0,
	};

	for (const ballot of ballots) {
		if (ballot.side === 1) {
			ballotData.affBallot = ballot.id;
		}

		if (ballot.side === 2) {
			ballotData.negBallot = ballot.id;
		}
	}

	return res.status(200).json(ballotData);
};

export async function saveRubric(req, res) {
	const autoSave = req.body;
	const judgeId = parseInt(req.params.judgeId);

	// putting the judgeId into parameters and not the body because
	// eventually I'll want to put these access checks up the chain

	if (!req.session) {
		return res.status(200).json({
			error   : true,
			message : 'You do not appear to be logged in with a current active session',
		});
	}

	const judgeOK = await checkJudgePerson(req, judgeId);

	if (!judgeOK) {
		return res.status(200).json({
			error: true,
			message: 'You do not have permission to change that ballot',
		});
	}

	const ballot = await db.summon(db.ballot, autoSave.ballot);

	if (ballot?.judge !== judgeId) {
		return res.status(200).json({
			error   : true,
			message : `You are not the listed judge for that ballot.  ${ballot?.judge} vs ${judgeId}`,
		});
	}

	const score = await db.score.findOne({ where: { ballot: ballot.id, tag: 'rubric' } });
	delete autoSave.ballot;

	if (score && score.id) {

		try {
			score.content = JSON.stringify(autoSave);
			await score.save();
		} catch (err) {
			errorLogger.info(`Error encountered in savings scores ${err} ballot ${ballot.id} score ${score.id}`);
		}

	} else {

		try {
			await db.score.create({
				ballot  : ballot.id,
				tag     : 'rubric',
				value   : 0,
				content : JSON.stringify(autoSave),
			});
		} catch (err) {
			errorLogger.info(`Error encountered in savings scores ${err} ballot ${ballot?.id} score ${score?.id}`);
			errorLogger.info(req.params);
		}
	}

	return res.status(200).json({
		error: false,
		message: `Scores auto-saved!`,
	});
};

export default saveRubric;
