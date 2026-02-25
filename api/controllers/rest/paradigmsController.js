import personRepo from '../../repos/personRepo.js';
import { BadRequest, NotFound } from '../../helpers/problem.js';

async function getParadigms(req, res) {
	//get the search query from the query params
	const { search } = req.query;
	if (!search) {
		throw new BadRequest(req, res, 'Search query is required');
	}

	const paradigms = await personRepo.personSearch(search, {
		excludeBanned: true,
		excludeUnconfirmedEmail: true,
		hasValidParadigm: true,
		hasJudged: true,
		limit: 50,
		include: {
			judges: {
				fields: ['id'],
				include: {
					school: {
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
				.filter(j => j && j.School)
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
	const { personId } = req.params;
	if (!personId) {
		throw new BadRequest(req, res, 'Person ID is required');
	}

	const person = await personRepo.getPerson(personId, {
		excludeBanned: true,
		excludeUnconfirmedEmail: true,
		hasValidParadigm: true,
		settings: ['paradigm', 'paradigm_timestamp'],
	});

	if (!person) {
		return NotFound(req, res, 'Person not found or does not have a valid paradigm');
	}
	res.json({
		id: person.id,
		name: [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' '),
		lastReviewed: person.settings['paradigm_timestamp'] || null,
		paradigm: person.settings['paradigm'] || null,

	});

};

export default {
	getParadigms,
	getParadigmByPersonId,
};