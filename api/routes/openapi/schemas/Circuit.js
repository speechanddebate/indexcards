import * as z from 'zod';

export const restCircuit = z.object({
	id: z.number().positive().readonly(),
	name: z.nullish(z.string().max(63)),
	abbr: z.nullish(z.string().max(15)),
	//setting .meta will set openapi fields
	tz: z.nullish(z.string().max(63).meta({
		description: 'Time zone of the circuit',
	})),
	active: z.nullish(z.coerce.boolean()),
	state: z.nullish(z.string().regex(/^[A-Z]{2}$/),'State must be a valid 2-letter code').meta({
		example: 'MN',
	}),
	country: z.nullish(z.string().regex(/^[A-Z]{2}$/),'Country must be a valid 2-letter code').meta({
		example: 'US',
	}),
	webname: z.nullish(z.string().max(31)),
}).meta({
	//set the id to create a model, if no id, it will be inlined
	id: 'RestCircuit',
});