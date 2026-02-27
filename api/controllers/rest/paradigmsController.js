import personRepo from '../../repos/personRepo.js';
import { BadRequest, NotFound } from '../../helpers/problem.js';
import config from '../../../config/config.js';

async function getParadigms(req, res) {
	//get the search query from the query params
	const { search, limit = 50, offset = 0 } = req.query;
	if (!search) {
		throw new BadRequest(req, res, 'Search query is required');
	}
	if (limit > 100) {
		throw new BadRequest(req, res, 'Limit cannot exceed 100');
	}

	const paradigms = await personRepo.personSearch(search, {
		excludeBanned: true,
		excludeUnconfirmedEmail: true,
		hasValidParadigm: true,
		hasJudged: true,
		limit,
		offset,
		include: {
			Judges: {
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
	const sectionRecordInclude = {
		Section: {
			required: true,
			fields: ['id'],
			include: {
				Round: {
					required: true,
					publicPrimaryResults: true,
					fields: ['id','name','label'],
					include: {
						Event: {
							fields: ['id','abbr'],
							settings: ['aff_label','neg_label'],
						},
					},
				},
				Ballots: {
					fields: ['id', 'judgeId', 'side'],
					include: {
						Scores: {
							winloss: true,
							fields: ['id','tag','value'],
						},
						Entry: {
							fields: ['id','code'],
						},
					},
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
			Judges: {
				fields: ['id'],
				include: {
					Category: {
						required: true,
						fields: ['id'],
						include: {
							Tourn: {
								required: true,
								fields: ['id','name','start', 'hidden'],
							},
						},
					},
					Ballots : {
						fields: ['id','side'],
						winnerBallot: true,
						include: {
							...sectionRecordInclude,
							Scores: {
								winloss: true,
								fields: ['id','tag','value'],
							},
						},
					},
				},
			},
		},
	});
	if (!person) {
		return NotFound(req, res, 'Person not found or does not have a valid paradigm');
	}
	// Build record array: one element per ballot on each judge
	const record = [];

	for (const judge of person.Judges || []) {
		for (const judgeBallot of judge.Ballots || []) {
			// Skip non winner ballots

			const section = judgeBallot.Section;
			if (!section) continue;
			let affLabel = section.Round?.Event?.settings?.aff_label || 'Aff';
			let negLabel = section.Round?.Event?.settings?.neg_label || 'Neg';

			let affTeam = null;
			let negTeam = null;

			let affWins = 0;
			let negWins = 0;

			let judgeVote = null;

			for (const ballot of section.Ballots || []) {
				const entryName = ballot.Entry?.code;
				// Identify entries (will repeat, but safe)
				if (ballot.side == 1 && !affTeam) {
					affTeam = entryName;
				}

				if (ballot.side == 2 && !negTeam) {
					negTeam = entryName;
				}
				const winScore = ballot.Scores?.find(
					s => s.tag === 'winloss'
				);

				// Count panel votes
				if (winScore?.value === 1) {
					if (ballot.side == 1) affWins++;
					if (ballot.side == 2) negWins++;
				}

				// Detect THIS judge's vote
				if (
					ballot.judgeId === judge.id &&
					winScore?.value === 1
				) {
					judgeVote = ballot.side == 1 ? affLabel : negLabel;
				}
			}

			// Determine panel majority winner
			let panelVote = null;

			if (affWins > negWins) panelVote = affLabel;
			else if (negWins > affWins) panelVote = negLabel;
			else panelVote = 'Tie'; // optional handling

			let roundLabel = section?.Round?.label;
			if (!roundLabel && section?.Round?.name) {
				roundLabel = `R${section.Round.name}`;
			}
			record.push({
				tournName: judge.Category?.Tourn?.name || 'Unknown Tournament',
				roundDate: judge.Category?.Tourn?.start || null,
				roundLabel,
				eventAbbr: section?.Round?.Event?.abbr || null,
				affTeam,
				affLabel,
				negTeam,
				negLabel,
				vote: judgeVote,   // this judge's vote
				panelVote,         // overall result
				record: `${affWins}-${negWins}`, // optional
			});
		}
	}
	res.json({
		id: person.id,
		name: [person.firstName, person.middleName, person.lastName].filter(Boolean).join(' '),
		lastReviewed: person.settingsTimestamps['paradigm']?.updatedAt || null,
		paradigm: person.settings['paradigm'] || null,
		record,
		certifications: person.PersonQuizzes?.map(pq => ({
			title: pq.Quiz?.label,
			description: pq.Quiz?.description,
			updatedAt: pq.updatedAt,
			badge: {
				altText: pq.Quiz?.badgeDescription || null,
				imageUrl: (pq.Quiz?.id && pq.Quiz?.badge) ? `${config.S3_URL}/badges/${pq.Quiz.id}/${pq.Quiz.badge}`
					: null,
				link: pq.Quiz?.badgeLink || null,
			},
		})),
	});
};

export default {
	getParadigms,
	getParadigmByPersonId,
};