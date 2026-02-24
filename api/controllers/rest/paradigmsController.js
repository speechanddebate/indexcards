import personRepo from '../../repos/personRepo.js';
import { BadRequest } from '../../helpers/problem.js';

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
		include: {
			chapterJudges: {
				fields: ['id'],
				include: {
					chapter: {
						fields: ['id','name'],
					},
				},
			},
		},
	});

	const results = paradigms.map(p => {
		const nameParts = [p.firstName, p.middleName, p.lastName].filter(Boolean);
		return {
			id: p.id,
			name: nameParts.join(' '),
			chapters: p.ChapterJudges
				? p.ChapterJudges
					.filter(cj => cj && cj.Chapter)
					.map(cj => ({
						id: cj.Chapter.id,
						name: cj.Chapter.name,
					}))
				: [],
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
		settings: ['paradigm'],
	});

	if (!person) {
		res.status(404).json({ message: 'Person not found or does not have a valid paradigm' });
		return;
	}
	res.json({
		id: person.id,
		name: [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' '),
		paradigm: person.settings['paradigm'] || null,

	});

};

export default {
	getParadigms,
	getParadigmByPersonId,
};