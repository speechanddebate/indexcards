	import z from 'zod';
	import type { ZodOpenApiSchemaObject } from 'zod-openapi';
	import { Ballot, Judge, Event, Entry, Round, Tourn } from './index.js';
	import { Room } from './Room.js';
	import * as utils from './utils.js';
	export const CurrentBallot = z.object({
		id: utils.id,
		name: Round.shape.name,
		label: Round.shape.label,
		flipStatus: z.enum(['done','winner','second','anyone']).nullable(),
		flight: z.int().positive().nullable().meta({ description: "null if not flighted. otherwise flight num."}),
		show_async: z.boolean(),
		onlineBallots: z.boolean().meta({ description: 'true if the tournament uses online ballots'}),
		legion: z.boolean(),
		start: z.iso.datetime(),
		deadline: z.iso.datetime(),
		roomId: Room.shape.id.nullable(),
		roomName: Room.shape.name.nullable(),
		roomUrl: Room.shape.url.nullable(),
		roomNotes: Room.shape.notes.nullable(),
		JudgeId: Judge.shape.id,
		RoundId: Round.shape.id,
		status: z.enum(['not_started','started','scored']),
		startText: z.string().max(127).nullable(),
		ballotText: z.string().max(127).nullable(),
		chair: z.boolean(),
		audited: z.boolean(),
		TournTz: Tourn.shape.tz,
		eventType: Event.shape.type,
		onlineMode: Event.shape.settings.shape.online_mode,
		Entries: z.array(z.object({
			id: Entry.shape.id,
			code: Entry.shape.code,
			side: z.string().nullable(),
			speakerOrder: Ballot.shape.speakerOrder.nullable(),
		})),
	}).strict().meta({
		id: 'CurrentBallot',
	}) satisfies ZodOpenApiSchemaObject;
	export type CurrentBallotType = z.infer<typeof CurrentBallot>;
