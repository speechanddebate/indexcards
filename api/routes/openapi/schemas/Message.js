import z from 'zod';
import * as utils from './utils.js';

export const InboxMessage = z.object({
	id: utils.id.meta({ description: 'The unique identifier for the message' }),
	subject: z.string().max(255).nullable().meta({ description: 'The subject of the message' }),
	body: z.string().max(65535).nullable().meta({ description: 'The body of the message' }),
	url: z.url().max(511).nullable().meta({ description: 'The URL associated with the message' }),
	visibleAt: z.string().nullable().meta({ description: 'The timestamp when the message became visible' }),
	readAt: z.string().nullable().meta({ description: 'The timestamp when the message was read' }),
	Tourn: z.object({
		id: utils.id.meta({ description: 'The unique identifier for the tournament' }),
		name: z.string().max(63).nullable().meta({ description: 'The name of the tournament' }),
		webname: z.string().max(64).nullable().meta({ description: 'The web name of the tournament' }),
	}).nullable().meta({ description: 'The tournament associated with the message' }),
	Sender: z.object({
		name: z.string().nullable().meta({ description: 'The name of the sender' }),
		email: z.string().max(127).nullable().meta({ description: 'The email of the sender' }),
	}).nullable().meta({ description: 'The sender of the message' }),
	Email: z.object({
		content: z.string().nullable().meta({ description: 'The content of the email' }),
	}).nullable().meta({ description: 'The email associated with the message' }),
}).meta({
	id: 'InboxMessage',
});