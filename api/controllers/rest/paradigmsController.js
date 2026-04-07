import personRepo from '../../repos/personRepo.js';
import { NotFound } from '../../helpers/problem.js';
import config from '../../../config/config.js';
import { judgeRecord } from '../../services/results/judgeRecords.js';

async function getParadigms(req, res) {
	//get the search query from the query params
	const { search, limit = 50, offset = 0 } = req.valid.query;

	const paradigms = await personRepo.personSearch(search ?? '', {
		excludeBanned: true,
		excludeUnconfirmedEmail: true,
		hasValidParadigm: true,
		hasJudged: true,
		limit: limit,
		offset: offset,
		include: {
			Judges: {
				fields: ['id','createdAt'],
				include: {
					School: {
						fields: ['id','name'],
					},
				},
			},
		},
	});
	const results = paradigms.map(p => {
		const nameParts = [p.firstName, p.middleName, p.lastName].filter(Boolean);
		// Get all schools from Judges
		const schools = p.Judges
			? p.Judges
				.filter(j => {
					if (!j || !j.School || !j.createdAt) return false;
					const fiveYearsAgo = new Date();
					fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
					return new Date(j.createdAt) >= fiveYearsAgo;
				})
				.map(j => ({
					id: j.School.id,
					name: j.School.name,
				}))
			: [];

		// Deduplicate schools by id
		const distinctSchools = Array.from(
			new Map(schools.map(s => [s.name, s])).values()
		);

		return {
			id: p.id,
			name: nameParts.join(' '),
			tournJudged: p.Judges ? p.Judges.length : 0,
			schools: distinctSchools,
		};
	});
	res.json(results);
};

async function getParadigmByPersonId(req, res) {
	const { personId } = req.valid.params;

	const certInclude = {
		PersonQuizzes: {
			isValid: true,
			fields: ['id', 'updatedAt'],
			include: {
				Quiz: {
					fields: ['id', 'label', 'description', 'badgeDescription', 'badge', 'badgeLink'],
				},
			},
		},
	};

	const person = await personRepo.getPerson(personId, {
		excludeBanned: true,
		excludeUnconfirmedEmail: true,
		hasValidParadigm: true,
		settings: ['paradigm'],
		include: {
			...certInclude,
		},
	});
	if (!person) {
		return NotFound(req, res, 'Person not found or does not have a valid paradigm');
	}

	res.json({
		id: person.id,
		name: [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' '),
		lastReviewed: person.settingsTimestamps['paradigm']?.updatedAt || null,
		paradigm: person.settings['paradigm'] || null,
		certifications: person.PersonQuizzes?.map(pq => ({
			title: pq.Quiz?.label,
			description: pq.Quiz?.description,
			updatedAt: pq.updatedAt?.toISOString() || null,
			badge: {
				altText: pq.Quiz?.badgeDescription || null,
				imageUrl: (pq.Quiz?.id && pq.Quiz?.badge) ? `${config.S3_URL}/badges/${pq.Quiz.id}/${pq.Quiz.badge}`
					: null,
				link: pq.Quiz?.badgeLink || null,
			},
		})) ?? [],
	});
};
/**
 *  Get a judges public debate judging record to display on the paradigm details page
 */
async function getJudgingRecord(req, res) {
	const { personId } = req.valid.params;

	const record = await judgeRecord(personId);

	const response = record.map(r =>
		Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? '']))
	);

	res.json(response);
}

export default {
	getParadigms,
	getParadigmByPersonId,
	getJudgingRecord,
};