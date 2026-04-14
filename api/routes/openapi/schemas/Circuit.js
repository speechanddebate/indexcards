import * as z from 'zod';
import * as utils from './utils.js';

export const activeCircuitsResponse = z.array(
	z.object({
		id: utils.id.meta({description: 'The unique identifier of the circuit'}),
		name: z.string().max(63).meta({description: 'The name of the circuit'}),
		abbr: z.string().max(15).meta({description: 'The abbreviation of the circuit'}),
		state: utils.TwoLetterCode.nullable().meta({description: 'The state of the circuit'}),
		country: utils.TwoLetterCode.nullable().meta({description: 'The country of the circuit'}),
		tournCount: z.number().int().positive().meta({description: 'The number of tournaments in the circuit'}),
	})
);

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