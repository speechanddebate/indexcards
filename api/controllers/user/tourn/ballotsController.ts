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

		function addFlightOffset(iso: string,section: any) {
			const date = new Date(iso);
			let add = 0;
			if (section.Round.flighted){
				add = (section.flight - 1) * (section.Judge.Category.Event.settings.flight_offset ?? 0);
			}
			date.setMinutes(date.getMinutes() + add);
			return date.toISOString();
		}
		
		function getStatus(s: any) {
			if (s.scored){
				return "scored"
			} else if (s.Ballots.some((b: any) => b.judge_started)){
				return 'started'
			}
			return "not_started"
		}

		ballots.push({
			id: s.id,
			name: s.Round.name,
			label: s.Round.label,
			flight: s.Round.flighted ? s.flight : null,
			flipStatus: s.settings.flip_status,
			status: getStatus(s),
			startText: s.Judge.Category.Event.settings.start_button,
			ballotText: s.Judge.Category.Event.settings.start_button_text,
			show_async: s.settings.show_async === 1,
			onlineBallots: s.Judge.Category.Event.settings.online_ballots ?? false,
			legion: s.Judge.Category.Tourn.settings.legion === 1,
			start: s.Round.start ? addFlightOffset(s.Round.start,s): addFlightOffset(s.Round.Timeslot.start,s),
			deadline: s.Round.end ? addFlightOffset(s.Round.end,s): addFlightOffset(s.Round.Timeslot.end,s),
			roomId: s.Room.id,
			roomName: s.Room.name,
			roomUrl: s.Room.url,
			roomNotes: s.Round.settings.judges_ballots_visible ? s.Room.notes : null,
			chair: s.Ballots.some((b: any) => b.chair),
			audited: s.Ballots.some((b: any) => b.audit),
			TournTz: s.Judge.Category.Tourn.tz,
			eventType: s.Judge.Category.Event.type,
			onlineMode: s.Judge.Category.Event.settings.online_mode,
			JudgeId: s.Judge.id,
			RoundId: s.Round.id,
			Entries: s.Entries.map((e: any) => {
				let side = null;
				if (s.settings.flip_status === undefined || s.settings.flip_status === 'done'){
					let ballot = s.Ballots.some(b => b.entry === e.id)	
					if (ballot.side) {
						if (ballot.side === 1){
							side = s.Event.settings.aff_label ?? "Aff";
						}
						if (ballot.side === 2){
							side = s.Event.settings.neg_label ?? "Neg";
						}
					}
				}
				return {
					id: e.id,
					code: e.code,
					side,
				};
			}),
		});
		return;
	});

	return res.json(ballots);
}

export default {
	getCurrent,
}
