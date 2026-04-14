import * as z from 'zod';

export const Judge = {
	type: 'object',
	properties: {

	},
};
/**
 *  A record of a judge's decision. used in paradigm record
 */
export const JudgeRecord = z.object({
	tournName: z.string().meta({
		description: 'Tournament name',
	}),
	roundDate: z.string().meta({
		description: 'Date of the round',
		format: 'date-time',
	}),
	roundLabel: z.string().meta({
		description: 'Label for the round (e.g., R2)',
	}),
	eventAbbr: z.string().meta({
		description: 'Event abbreviation (e.g., PF)',
	}),
	affTeam: z.string().meta({
		description: 'Affirmative team name',
	}),
	affLabel: z.string().meta({
		description: 'Affirmative label (e.g., Pro)',
	}),
	negTeam: z.string().meta({
		description: 'Negative team name',
	}),
	negLabel: z.string().meta({
		description: 'Negative label (e.g., Con)',
	}),
	vote: z.string().meta({
		description: "This judge's vote (e.g., Con)",
	}),
	panelVote: z.string().meta({
		description: 'Panel majority vote (e.g., Con)',
	}),
	record: z.string().meta({
		description: 'Win-loss record for the round (e.g., 0-1)',
	}),
}).meta({
	id: 'JudgeRecord',
	description: "A record of a judge's decision. used in paradigm details",
});
