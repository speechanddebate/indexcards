	import z from 'zod';
	import type { ZodOpenApiSchemaObject } from 'zod-openapi';
	import { Ballot, Judge, Category, Event, Entry, Round, Tourn } from './index.js';
	import { Room } from './Room.js';
	import * as utils from './utils.js';
	export const CurrentBallot = z.object({
		id: utils.id,
		flipStatus: z.string().nullable(),
		flight: z.int().positive().nullable(),
		startText: z.string().nullable(),
		show_async: z.boolean(),
		legion: z.boolean(),
		start: z.iso.datetime(),
		end: z.iso.datetime(),
		roomId: Room.shape.id.nullable(),
		roomUrl: Room.shape.url.nullable(),
		roomNotes: Room.shape.notes.nullable(),
		Judge: Judge.pick({
			id: true,
			code: true,
			first: true,
			last: true,
		}),
		Tourn: Tourn.pick({
			id: true,
			name: true,
			tz: true,
		}),
		Category: Category.pick({
			id: true,
			name: true,
			abbr: true,
		}),
		Event: z.object({
			...Event.pick({
			id: true,
			name: true,
			abbr: true,
			type: true}).shape,
			settings: Event.shape.settings.pick({
				flight_offset: true,
				online_mode: true,
				online_ballots: true,
			}),
		}),
		Round: Round.pick({
			id: true,
			name: true,
			label: true,
			flighted: true,
		}),
		Ballots: z.array(Ballot.pick({
			id: true,
			side: true,
			speakerOrder: true,
			chair: true,
		})),
		Entries: z.array(Entry.pick({
			id: true,
			code: true,
		})),
	}).strict().meta({
		id: 'CurrentBallot',
	}) satisfies ZodOpenApiSchemaObject;
	export type CurrentBallotType = z.infer<typeof CurrentBallot>;
