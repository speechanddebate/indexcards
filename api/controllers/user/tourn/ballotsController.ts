import type { Request, Response } from 'express';
import type { CurrentBallotType } from '../../../routes/openapi/schemas/index.js';
import sectionRepo from '../../../repos/sectionRepo.js';

export async function getCurrent(req: Request,res: Response) {
	const { tournId } = req.params;
	const sections = await sectionRepo.getCurrentBallots(req.actor.Person.id,tournId);

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

		function addFlightOffset(iso,section) {
			const date = new Date(iso);
			let add = 0;
			if (section.Round.flighted){
				add = (section.flight - 1) * section.Event.settings.flight_offset;
			}
			date.setMinutes(date.getMinutes() + add);
			return date.toISOString();
		}
		
		function getStatus(s) {
			if (s.scored){
				return "scored"
			} else if (s.Ballots.some(b => b.judge_started)){
				return 'started'
			}
			return "not_started"
		}

		ballots.push({
			id: s.id,
			flight: s.Round.flighted ? s.flight : null,
			flipStatus: s.settings.flip_status,
			status: getStatus(s),
			startText: s.Judge.Category.Event.settings.start_button,
			ballotText: s.Judge.Category.Event.settings.start_button_text,
			show_async: s.settings.show_async === 1,
			legion: s.Judge.Category.Tourn.settings.legion === 1,
			start: s.Round.start ? addFlightOffset(s.Round.start,s): addFlightOffset(s.Round.Timeslot.start,s),
			deadline: s.Round.end ? addFlightOffset(s.Round.end,s): addFlightOffset(s.Round.Timeslot.end,s),
			roomId: s.Room.id,
			roomName: s.Room.name,
			roomUrl: s.Room.url,
			roomNotes: s.Round.settings.judges_ballots_visible ? s.Room.notes : null,
			chair: s.Ballots.some((b) => b.chair),
			audited: s.Ballots.some((b) => b.audit),
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
					online_mode: s.Judge.Category.Event.settings.online_mode,
					online_ballots: s.Judge.Category.Event.settings.online_ballots === 1,
				},
			},
			JudgeId: s.Judge.id,
			Round: {
				id: s.Round.id,
				name: s.Round.name,
				label: s.Round.label,
			},
			Ballots: s.Ballots.map((b: any) => ({
				id: b.id,
				side: b.side === 1,
				speakerOrder: b.speakerOrder,
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
