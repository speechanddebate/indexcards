// From https://coderwall.com/p/jmarug/regex-to-check-for-valid-mysql-datetime-format
// Accepts both YYYY-MM-DD and YYYY-MM-DD HH:mm:ss
import type { ZodOpenApiSchemaObject } from 'zod-openapi';

const mysqlDate = '^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9])(?:( [0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$';

export const CaselistLink = {
	type : 'object',
	properties : {
		person_id    : { type : 'integer' },
		slug         : { type : ['string', 'null'] },
		caselist_key : { type : ['string', 'null'] },
		eventcode    : { type : ['integer', 'null'] },
	},
} as const satisfies ZodOpenApiSchemaObject;

export const Round = {
	type : 'object',
	properties : {
		id         : { type : 'integer' },
		name       : { type : ['string', 'null'] },
		timestamp  : { type : ['string', 'null'], pattern : mysqlDate },
	},
} as const satisfies ZodOpenApiSchemaObject;

export const Share = {
	type : 'object',
	properties : {
		panels      : { type : ['array', 'null'] },
		files       : { type : ['array', 'null'] },
		from        : { type : ['string', 'null'] },
	},
} as const satisfies ZodOpenApiSchemaObject;
export const Invite = {
	type : 'object',
	properties : {
		name : { type : ['string', 'null'] },
	},
} as const satisfies ZodOpenApiSchemaObject;

export const Search = {
	type : 'object',
	properties : {
		result : { type : ['string', 'null'] },
	},
} as const satisfies ZodOpenApiSchemaObject;
