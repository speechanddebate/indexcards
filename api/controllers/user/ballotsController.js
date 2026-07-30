import sectionRepo from '../../repos/sectionRepo.js';

export async function getCurrentBallots(req,res) {
	const sections = await sectionRepo.getCurrentBallots(req.actor.Person.id);

	let ballots = [];

	sections.forEach(s => {
		if(!s.Round.published || !s.Round.settings.judges_ballots_visible) {
			return;
		}
		ballots.push({
			id: s.id,
			flight: s.flight,
			startText: s.Judge.Category.Event.settings.start_button_text,
			Category: {
				id: s.Judge.Category.id,
				name: s.Judge.Category.name,
				abbr: s.Judge.Category.abbr,
			},
			Event: {
				id: s.Judge.Category.Event.id,
				name: s.Judge.Category.Event.name,
				abbr: s.Judge.Category.Event.abbr,
				type: s.Judge.Category.Event.type,
			},
			Judge: {
				id: s.Judge.id,
				code: s.Judge.code,
				first: s.Judge.first,
				last: s.Judge.last,
			},
		});
		return;
	});

	return res.json(ballots);
}
