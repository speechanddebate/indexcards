export const File = {
	type : 'object',
	description: 'A file',
	properties: {
		id: {
			type: 'integer',
			description: 'The unique identifier for the file',
			readOnly: true,
			example: 123,
		},
		tag: {
			type: 'string',
			nullable: true,
		},
		type: {
			type: 'string',
			nullable: true,
		},
		label: {
			type: 'string',
			nullable: true,
		},
		filename: {
			type: 'string',
			maxLength: 255,
			description: 'The filename of the file',
			example: 'example.pdf',
		},
		published: {
			type: 'boolean',
			description: 'Whether the file is published or not',
			example: true,
		},
		pageOrder: {
			type: 'integer',
			format: 'int16',
			nullable: true,
		},
		uploaded: {
			type: 'string',
			format: 'date-time',
			nullable: true,
		},
		lastModified: {
			type: 'string',
			format: 'date-time',
			description: 'When the file was last modified',
			readOnly: true,
			example: '2023-10-26T15:51:32.000Z',
		},
	},
};