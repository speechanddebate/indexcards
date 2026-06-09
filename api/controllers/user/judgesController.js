import  judgeRepo from '../../repos/judgeRepo.js';
import chapterJudgeRepo from '../../repos/chapterJudgeRepo.js';
import chapterRepo from '../../repos/chapterRepo.js';
import personRepo from '../../repos/personRepo.js';
import tabroomRepo from '../../repos/tabroomRepo.js';
import changeLogRepo from '../../repos/changeLogRepo.js';
import { profanityCheck, sanitizeHTML } from '../../helpers/text.js';
import { BadRequest, Forbidden } from '../../helpers/problem.js';
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
		return res.status(200).json({
			message: 'Judge claim request submitted',
			detail: 'A message has been sent to your chapter admins to approve this request.',
		});
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

	// get the chapter admins
	const admins = await chapterRepo.getAdmins(chapterJudge.chapter);

	if(admins.some(a => a.id === req.actor.id)) {
		await chapterJudgeRepo.updateChapterJudge(chapterJudgeId, { person: req.actor.id, person_request: null });
		return res.status(200).json({
			message: 'Judge linked successfully.',
			detail: 'Because you are a chapter admin, your request to link to this judge has been automatically approved.',
		});
	}
	if(admins.some(a => a.email && !a.no_email)) {
		const emailData = buildChapterJudgeClaimEmail(chapterJudge, req.actor.Person);
		await notify({
			ids: [...admins.filter(a => a.email && !a.no_email).map(a => a.id)],
			...emailData,
		});
	} else {
		logger.warn('Chapter with id ' + chapterJudge.chapter + ' has no admins setup to receive emails. Cannot send judge claim notification email.');
	}
	await chapterJudgeRepo.updateChapterJudge(chapterJudgeId, { person_request: req.actor.id });
	return res.status(200).json({
		message: 'Judge claim request submitted',
		detail: 'A message has been sent to your chapter admins to approve this request.',
	});

};

//get the judge history for /user/judge/history page.
async function history(req, res) {
	const { limit, offset } = req.valid.query;

	if(!req.actor.Person.id) {
		return BadRequest(req, res, 'Request not made by a person');
	}

	const judgeHistory = await judgeRepo.getJudgeHistory(req.actor.Person.id, limit, offset);
	return res.status(200).json(judgeHistory.map(j => ({
		Tourn: {
			id: j.Tourn.id,
			name: j.Tourn.name,
			start: j.Tourn.start,
			end: j.Tourn.end,
		},
		division: j.Category.name,
		roundsJudged: j.roundCount,
		roundsObligated: (j.obligation ?? 0) + (j.hired ?? 0),
	})));
};

async function getParadigm(req, res) {
	return res.status(501);
}

async function updateParadigm(req, res) {

	const Person = await personRepo.getPerson(req.actor.Person.id, {
		settings: ['email_unconfirmed'],
	});
	//check ability to save. check email confirmation, word count, profanity
	if(Person.settings['email_unconfirmed'])
		return Forbidden(req, res, 'You must confirm your email before saving a paradigm');

	//check word count limits
	const tabSettings = await tabroomRepo.getSettings([
		'paradigm_word_limit',
	]);
	if(tabSettings.filter(s => s.tag === 'paradigm_word_limit')[0]?.value > 0){
		const wordLimit = parseInt(tabSettings.filter(s => s.tag === 'paradigm_word_limit')[0].value);
		const wordCount = req.valid.body.paradigm.split(/\s+/).length;
		if(wordCount > wordLimit){
			return BadRequest(req, res, `Paradigm exceeds the word limit of ${wordLimit}. Your paradigm has ${wordCount} words.`);
		}
	} else {
		logger.debug('no paradigm word limit set, skipping word count check');
	}

	const naughtywords = profanityCheck(req.valid.body.paradigm);
	if(naughtywords.length > 0){
		return BadRequest(req, res, 'paradigm contains prohibited words', { words: naughtywords });
	}
	const cleanParadigm = sanitizeHTML(req.valid.body.paradigm);
	if(cleanParadigm !== req.valid.body.paradigm){
		logger.debug('Paradigm was modified by sanitization.', { original: req.valid.body.paradigm, clean: cleanParadigm });
	}
	//update the paradigm and relevant settings
	await personRepo.savePersonSettings(Person.id, {
		paradigm: cleanParadigm,
	});

	try {
		await changeLogRepo.createChangeLog({
			tag: 'paradigm',
			person: Person.id,
			description: `Saved new paradigm from session ${req.session.id} logged in from ${req.ip}${req.actor.su ? ` while SU'd from account ${req.actor.su.email}` : ''}`,
		});
	} catch (err) {
		logger.error('Failed to log paradigm change in change log', { error: err });
	}

	return res.status(204).send();
}
export default {
	linkRequests,
	claimRequest,
	history,
	getParadigm,
	updateParadigm,
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