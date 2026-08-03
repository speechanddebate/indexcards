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
			flipStatus: s.settings.flip_status,
			startText: s.Judge.Category.Event.settings.start_button_text,
			show_async: s.settings.show_async === 1,
			legion: s.Judge.Category.Tourn.settings.legion === 1,
			start: s.Round.Timeslot.start,
			end: s.Round.Timeslot.end,
			roomId: s.Room.id,
			roomUrl: s.Room.url,
			roomNotes: s.Room.notes,
			Tourn: {
				id: s.Judge.Category.Tourn.id,
				name: s.Judge.Category.Tourn.name,
				tz: s.Judge.Category.Tourn.tz,
			},
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
				settings: {
					flight_offset: s.Judge.Category.Event.settings.flight_offset,
					online_mode: s.Judge.Category.Event.settings.online_mode,
					online_ballots: s.Judge.Category.Event.settings.online_ballots === 1,
				},
			},
			Judge: {
				id: s.Judge.id,
				code: s.Judge.code,
				first: s.Judge.first,
				last: s.Judge.last,
			},
			Round: {
				id: s.Round.id,
				name: s.Round.name,
				label: s.Round.label,
				flighted: s.Round.flighted,
			},
			Ballots: s.Ballots.map((b: any) => ({
				id: b.id,
				side: b.side === 1,
				speakerOrder: b.speakerOrder,
				chair: b.chair === 1,
			})),
			Entries: s.Entries.map((e: any) => ({
				id: e.id,
				code: e.code,
			})),
		});
		return;
	});

	return res.json(ballots);
}
