import  judgeRepo from '../../repos/judgeRepo.js';
import chapterJudgeRepo from '../../repos/chapterJudgeRepo.js';
import chapterRepo from '../../repos/chapterRepo.js';
import { BadRequest } from '../../helpers/problem.js';
import { Op } from 'sequelize';
import { notify } from '../../helpers/blast.js';
import logger from '../../helpers/logger.js';

async function linkRequests(req, res) {

	const [judges, chapterJudges] = await Promise.all([
		judgeRepo.getJudges({ where: { person_request: req.actor.id } }),
		chapterJudgeRepo.getChapterJudges({ where: { person_request: req.actor.id } }),
	]);
	let results = [];
	judges.forEach(j => {
		results.push({
			id: j.id,
			type: 'judge',
			first: j.first,
			last: j.last,
		});
	});
	chapterJudges.forEach(cj => {
		results.push({
			id: cj.id,
			type: 'chapter_judge',
			first: cj.first,
			last: cj.last,
		});
	});
	return res.status(200).json(results);
};
// handle a request to claim an unlinked judge or chapter judge.
async function claimRequest(req, res) {
	const { judgeId, chapterJudgeId } = req.valid.query;
	// XOR validation: exactly one must be present
	if ((!!judgeId && !!chapterJudgeId) || (!judgeId && !chapterJudgeId))
		return BadRequest(req, res, 'Must provide exactly one of judgeId or chapterJudgeId');

	if (judgeId) {
		const judge = await judgeRepo.getJudge(judgeId);
		// grab judge, verify it has a category
		if (!judge || !judge.category) {
			return BadRequest(req, res, 'Invalid judge ID or judge has no category');
		}
		// search for other judges in the category the person has claimed or requested, error if any exist
		const already = await judgeRepo.getJudges({
			where: {
				category: judge.category,
				[Op.or]: [
					{ person: req.actor.id },
					{ person_request: req.actor.id },
				],
			},
		});
		if (already.length > 0) {
			return BadRequest(req, res, `You are already linked to another ${judge.category} judge.  You may only link to one judge in a given tournament.  If you are trying to link yourself to all your school's judges, please DO NOT.  Every judge must be linked to their OWN Tabroom account.`);
		}
		await judgeRepo.updateJudge(judgeId, { person_request: req.actor.id });
		return res.status(204).end();
	}
	//grab chapter judge, verify it has a chapter
	const chapterJudge = await chapterJudgeRepo.getChapterJudge(chapterJudgeId);
	if (!chapterJudge || !chapterJudge.chapter) {
		return BadRequest(req, res, 'Invalid chapter judge ID or chapter judge has no chapter');
	}
	// search for other chapter judges in the chapter the person has claimed or requested, error if any exist
	const already = await chapterJudgeRepo.getChapterJudges({
		where: {
			chapter: chapterJudge.chapter,
			[Op.or]: [
				{ person: req.actor.id },
				{ person_request: req.actor.id },
			],
		},
	});
	if (already.length > 0) {
		return BadRequest(req, res, `You are already linked to another judge on that school's roster. You can only be linked to 1 judge per roster at a time. If you are linking yourself to all your school's judges, DO NOT. Each judge must have their OWN Tabroom account for the system to function.`);
	}
	await chapterJudgeRepo.updateChapterJudge(chapterJudgeId, { person_request: req.actor.id });

	// get the chapter admins
	const admins = await chapterRepo.getAdmins(chapterJudge.chapter);

	if(!admins.some(a => a.email && !a.no_email)) {
		logger.warn('Chapter with id ' + chapterJudge.chapter + ' has no admins setup to receive emails. Cannot send judge claim notification email.');
		return res.status(204).end();
	}
	const emailData = buildChapterJudgeClaimEmail(chapterJudge, req.actor.Person);
	await notify({
		ids: [...admins.filter(a => a.email && !a.no_email).map(a => a.id)],
		...emailData,
	});
	return res.status(204).end();

};

export default {
	linkRequests,
	claimRequest,
};

function buildChapterJudgeClaimEmail(chapterJudge, person) {
	let text = `The Tabroom user \n\n${person.first} ${person.last} (${person.email}) \n\n
	has requested online access to updates, ballots and texts for judge ${chapterJudge.first} ${chapterJudge.last} in your team roster.\n\n
	If these are the same people, approve this request by logging into Tabroom and visiting\n\n
	https://tabroom.com/user/chapter/judges.mhtml?chapter_id=${chapterJudge.chapter}\n\n
	If this is not authorized, you do not need to do anything.\n\n`;
	return {
		subject: `[Tabroom] ${person.email} requests access to judge ${chapterJudge.first} ${chapterJudge.last}`,
		from: `Tabroom Link <judgelink_${String(Date.now()).slice(-6)}@www.tabroom.com>`,
		replyTo: `${person.first} ${person.last} <${person.email}>`,
		text,
	};
};