import * as utils from './utils.js';
import * as z from 'zod';
import type { ZodOpenApiSchemaObject } from 'zod-openapi';

export const Judge = z.object({
	id: utils.id,
	code: z.string().max(8).nullable(),
	first: z.string().max(63).nullable(),
	middle: z.string().max(63).nullable(),
	last: z.string().max(63).nullable(),
	obligation: z.int().nullable(),
}).meta({ id: 'Judge'}) satisfies ZodOpenApiSchemaObject;

export const UnlinkedJudge = z.object({
	id: utils.id,
	type: z.enum(['judge', 'chapter_judge']),
	first: z.string().nullable(),
	last: z.string().nullable(),
	schoolName: z.string().nullish(),
	tournName: z.string().nullish(),
	tournCount: z.number().int().nonnegative().optional(), // for chapter judges
}) satisfies ZodOpenApiSchemaObject;
/**
 *  A record of a judge's decision. used in paradigm record
 */
export const JudgeRecord = z.object({
	Tourn: z.object({
		id: utils.id.meta({
			description: 'Tournament id',
		}),
		name: z.string().meta({
			description: 'Tournament name',
		}),
	}).meta({
		description: 'Tournament details',
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
}) satisfies ZodOpenApiSchemaObject;

export const JudgeHistory = z.object({
	Tourn: z.object({
		id: utils.id.meta({
			description: 'Tournament id',
		}),
		name: z.string().meta({ description: 'Tournament name' }),
		start: z.iso.datetime().meta({
			description: 'start date',
		}),
		end: z.iso.datetime().meta({
			description: 'end date',
		}),
	}).meta({
		description: 'Tournament details',
	}),
	division: z.string().meta({ description: 'Division name (e.g., Open, JV)' }),
	roundsJudged: z.number().int().nonnegative().meta({
		description: 'Number of rounds judged at the tournament',
	}),
	roundsObligated: z.number().int().nonnegative().meta({
		description: 'Number of rounds obligated at the tournament',
	}),
}).meta({
	id: 'JudgeHistory',
	description: "A person's history of judging",
}) satisfies ZodOpenApiSchemaObject;
