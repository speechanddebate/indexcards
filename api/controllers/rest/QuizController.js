import quizRepo from '../../repos/quizRepo.js';
import config from '../../../config/config.js';

async function getQuizzes(req, res) {
	//if a person is requesting, include their PersonQuiz data to determine if they've taken any quizzes or not
	const personId = req.actor?.Person?.id;
	const include = personId ? {
		PersonQuizzes: {
			where: {
				person: personId,
			},
		},
	} : undefined;

	const quizzes = await quizRepo.getQuizzes({
		limit: req.valid?.query?.limit ?? undefined,
		offset: req.valid?.query?.offset ?? undefined,
		where: {
			sitewide: true,
			hidden: false,
			admin_only: false,
		},
		...(include ? { include } : {}),
	});
	res.json(quizzes.map(q => ({
		id: q.id,
		tag: q.tag,
		label: q.label,
		description: q.description,
		sitewide: q.sitewide,
		hidden: q.hidden,
		approval: q.approval,
		show_answers: q.show_answers,
		admin_only: q.admin_only,
		circuit: q.circuit === 0 ? null : q.circuit,
		Badge: {
			altText: q.badge_description || null,
			imageUrl: (q.id && q.badge) ? `${config.S3_URL}/badges/${q.id}/${q.badge}`
					: null,
			link: q.badge_link || null,
		},
		PersonQuizzes: q.PersonQuizzes?.map(pq => ({
			id: pq.id,
			person: pq.person,
			quiz: pq.quiz,
			pending: pq.pending,
			approvedBy: pq.approved_by,
			updatedAt: pq.timestamp,
		})) ?? [],
	})));
};

export default {
	getQuizzes,
};