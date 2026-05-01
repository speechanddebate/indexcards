import z from 'zod';
import * as utils from './utils.js';

const PersonZod = z.object({
	id: utils.id,
	email: z.string().email(),
	firstName: z.string(),
	middleName: z.string().nullable(),
	lastName: z.string(),
	state: z.string(),
	country: z.string(),
	tz: z.string(),
	createdAt: z.iso.datetime(),
	settings: z.object().optional(),
	metadata: z.object().optional(),
}).meta({
	id: 'Person',
	description: 'A person (user) in tabroom',
});

export const Person = {
	type : 'object',
	description: 'A person (user) in tabroom',
	additionalProperties: false,
	required: ['id', 'email', 'firstName', 'lastName'],
	properties : {
		id: {
			type: 'integer',
			example: 42,
		},
		email: {
			type: 'string',
			format: 'email',
			example: 'johndoe@tabroom.com',
		},
		firstName: {
			type: 'string',
			example: 'John',
		},
		middleName: {
			type: 'string',
			nullable: true,
			example: 'Quincy',
		},
		lastName: {
			type: 'string',
			example: 'Doe',
		},
		state: {
			type: 'string',
			example: 'CA',
		},
		country: {
			type: 'string',
			example: 'USA',
		},
		tz: {
			type: 'string',
			example: 'America/Los_Angeles',
		},
		createdAt: {
			type        : 'string',
			readOnly    : true,
			format      : 'date-time',
			description : 'Creation timestamp',
		},
		settings  : { type : 'object', additionalProperties: { type: 'string' } } ,
		metadata  : { type : 'object', additionalProperties: { type: 'string' } } ,
	},
};

export const Session = z.object({
	id: utils.id,
	person: utils.id,
	su: utils.id.nullable(),
	Su: PersonZod.nullable(),
	Person: PersonZod,
}).meta({
	id: 'Session',
	description: 'A user session',
});
//export const Session = {
//	type: 'object',
//	description: 'A user session',
//	additionalProperties: false,
//	properties: {
//		id: {
//			type: 'integer',
//			example: 111111,
//		},
//		person: {
//			type: 'integer',
//			example: 42,
//		},
//		su: {
//			type: 'integer',
//			nullable: true,
//			example: 7,
//		},
//		Su: {
//			nullable: true,
//			$ref: '#/components/schemas/Person',
//		},
//		Person: {
//			$ref: '#/components/schemas/Person',
//		},
//	},
//};

export const ParadigmDetails = z.object({
	id: utils.id.meta({
		description: 'The id of the person associated with the paradigm',
	}),
	name: z.string().nullable().meta({
		description: 'The name of the person associated with the paradigm',
	}),
	lastReviewed: z.iso.datetime().nullable().meta({
		description: 'The last reviewed timestamp of the paradigm',
	}),
	paradigm: z.string().nullable().meta({
		description: 'The content of the paradigm',
	}),
	certifications: z.array(z.object({
		title: z.string().meta({ description: 'The title of the certification' }),
		description: z.string().meta({ description: 'The description of the certification' }),
		updatedAt: z.iso.datetime().meta({ description: 'The last updated timestamp of the certification' }),
		badge: z.object({
			altText: z.string().nullable().meta({ description: 'The alt text for the badge image' }),
			link: z.url().nullable().meta({ description: 'The link to the badge' }),
			imageUrl: z.url().nullable().meta({ description: 'The URL of the badge image' }),
		}).optional().meta({ description: 'The badge associated with the certification' }),
	})).meta({ description: 'The list of certifications associated with the paradigm' }),
});