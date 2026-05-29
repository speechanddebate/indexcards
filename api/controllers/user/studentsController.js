import studentRepo from '../../repos/studentRepo.js';
import { BadRequest } from '../../helpers/problem.js';
import { notify } from '../../helpers/blast.js';
import chapterRepo from '../../repos/chapterRepo.js';
import { Op } from 'sequelize';
import logger from '../../helpers/logger.js';

async function linkRequests(req, res) {
	const students = await studentRepo.getStudents({ where: { person_request: req.actor.id } });

	let results = [];
	students.forEach(s => {
		results.push({
			id: s.id,
			first: s.first,
			last: s.last,
			chapterId: s.chapter,
			createdAt: s.createdAt,
		});
	});
	return res.status(200).json(results);
};

async function claimRequest(req, res) {
	const { studentId } = req.valid.query;
	if (!studentId) return BadRequest(req, res, 'Must provide studentId');

	const student = await studentRepo.getStudent(studentId);
	if (!student) {
		return BadRequest(req, res, 'Invalid student ID');
	}

	const already = await studentRepo.getStudents({
		where: {
			chapter: student.chapter,
			[Op.or]: [
				{ person: req.actor.id },
				{ person_request: req.actor.id },
			],
		},
	});
	if (already.length > 0) {
		return BadRequest(req, res, `You are already linked or have requested to be linked to another student on that school's roster. You can only be linked to 1 student per roster at a time. If you are linking yourself to all your school's students, DO NOT. Each student must have their OWN Tabroom account for the system to function.`);
	}

	// get the chapter admins
	const admins = await chapterRepo.getAdmins(student.chapter);

	//if the person requesting is an admin for the chapter, auto-approve the request and skip sending the email
	if(admins.some(a => a.id === req.actor.id)) {
		await studentRepo.updateStudent(studentId, { person: req.actor.id, person_request: null });
		return res.status(200).json({
			message: 'Competitor linked successfully.',
			detail: 'Because you are a chapter admin, your request to link to this student has been automatically approved.',
		});

	}
	await studentRepo.updateStudent(studentId, { person_request: req.actor.id });

	if(admins.some(a => a.email && !a.no_email)) {
		const emailData = buildChapterStudentClaimEmail(student, req.actor.Person);
		await notify({
			ids: [...admins.filter(a => a.email && !a.no_email).map(a => a.id)],
			...emailData,
		});
	} else {
		logger.warn('Chapter with id ' + student.chapter + ' has no admins setup to receive emails. Cannot send student claim notification email.');
	}
	return res.status(200).json({
		message: 'Competitor claim request submitted',
		detail: 'A message has been sent to your chapter admins to approve this request. You will receive a notification once they have processed it.',
	});
}

export default {
	linkRequests,
	claimRequest,
};

function buildChapterStudentClaimEmail(chapterStudent, person) {
	let text = `The Tabroom user \n\n${person.first} ${person.last} (${person.email}) \n\n
	has requested online access to updates, ballots and texts for competitor ${chapterStudent.first} ${chapterStudent.last} on your team roster.\n\n
	If these are the same people, approve this request by logging into Tabroom and visiting\n\n
	https://tabroom.com/user/chapter/students.mhtml?chapter_id=${chapterStudent.chapter}\n\n
	If this is not authorized, you do not need to do anything.\n\n`;
	return {
		subject: `[Tabroom] ${person.email} requests access to competitor ${chapterStudent.first} ${chapterStudent.last}`,
		from: `Tabroom Link <studentlink_${String(Date.now()).slice(-6)}@www.tabroom.com>`,
		replyTo: `${person.first} ${person.last} <${person.email}>`,
		text,
	};
};