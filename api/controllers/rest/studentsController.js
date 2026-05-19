import changeLogRepo from '../../repos/changeLogRepo.js';
import studentRepo from '../../repos/studentRepo.js';
import logger from '../../helpers/logger.js';
import personRepo from '../../repos/personRepo.js';
import { RateLimitExceeded } from '../../helpers/problem.js';

const STUDENT_SEARCH_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const STUDENT_SEARCH_LIMIT_MAX = 9;

export async function unlinkedSearch(req, res) {
	let { first, last } = req.valid.query;

	if (!first || !last) {
		first = req.actor.Person.first;
		last = req.actor.Person.last;
	}
	// log access to student search to the change log
	logStudentSearch(req.session, first, last).catch(err => {
		logger.error('Failed to log student search usage to changeLog:', err);
	});

	// if person is not site admin, apply rate limiting logic via person settings
	if (!req.actor.Person?.site_admin) {
		const person = await personRepo.getPerson(req.actor.id, {
			settings: ['last_student_search', 'student_search_count'],
		});

		const lastSearch = person?.settings?.last_student_search ? new Date(person.settings.last_student_search) : null;
		const studentSearchCount = Number(person?.settings?.student_search_count || 0);
		const now = new Date();
		const then = new Date(now.getTime() - STUDENT_SEARCH_LIMIT_WINDOW_MS);

		if (
			lastSearch
      && !Number.isNaN(lastSearch.getTime())
      && lastSearch > then
      && studentSearchCount > STUDENT_SEARCH_LIMIT_MAX
		) {
			return RateLimitExceeded(req, res,
				'Due to privacy concerns, you may only search for student records a few times every 24 hours.',
				{ validate: { trustProxy: false } }
			);
		}

		const nextStudentSearchCount = person?.settings?.student_search_count
      ? 1
      : studentSearchCount + 1;

		await personRepo.savePersonSettings(req.actor.id, {
			student_search_count: nextStudentSearchCount,
			last_student_search: now,
		});
	}

	const results = await studentRepo.unlinkedSearch({ first, last });

	res.json(results.map(s => ({
		id: s.id,
		first: s.first,
		middle: s.middle,
		last: s.last,
		gradYear: s.grad_year ?? null,
		Chapter: {
			name: s.chapter_name,
			state: s.chapter_state,
		},
		tournCount: s.tourn_count,
	})));
}

async function logStudentSearch(session, first, last) {
	let description = `Searched for student records ${first} ${last}`;

	if (session.su > 0 && session.Su?.email) {
		description += ` while logged in as ${session.Su.email}`;
	}

	description += ` from session ID ${session.id}`;

	await changeLogRepo.createChangeLog({
		tag: 'student_search',
		person: session.su ?? session.person,
		description,
	});
}
