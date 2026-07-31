import type { Request, Response } from 'express';
import type { CurrentBallotType } from '../../routes/openapi/schemas/index.js';
import sectionRepo from '../../repos/sectionRepo.js';

export async function getCurrentBallots(req: Request, res: Response) {
	const sections = await sectionRepo.getCurrentBallots(req.actor.Person.id);

	let ballots: CurrentBallotType[] = [];

	sections.forEach(s => {
		if(!s.Round.published || !s.Round.settings.judges_ballots_visible) {
			return;
		}
		if(s.Ballots.some((b: any) => b.audit === 1)){
			if(
				s.Ballots.every((b: any) => b.chair !== 1) && 
				s.Judge.Category.Event.type !== 'mock_trial' && 
				s.Judge.Category.Event.type !== 'congress' &&
				Date.now() < s.Round.Timeslot.end
			){ 
				return;
			}
		}
		if(s.Judge.Category.Event.settings.online_mode === 'async' && s.Round.Timeslot.end < Date.now()){
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
