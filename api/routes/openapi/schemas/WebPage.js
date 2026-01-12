export const WebPage = {
	type : 'object',
	description: 'A webpage',
	properties: {
		id: {
			type: 'integer',
			format: 'int32',
			description: 'Unique identifier',
			readOnly: true,
		},

		title: {
			type: 'string',
			maxLength: 63,
			nullable: true,
			description: 'Title of the page',
		},

		content: {
			type: 'string',
			nullable: true,
			description: 'Page content',
		},

		published: {
			type: 'boolean',
			description: 'Whether the page is published',
		},

		sitewide: {
			type: 'boolean',
			description: 'Whether the page is visible sitewide',
		},

		special: {
			type: 'string',
			maxLength: 15,
			nullable: true,
			description: 'Special page identifier or mode',
		},

		pageOrder: {
			type: 'integer',
			format: 'int16',
			nullable: true,
			description: 'Ordering value for page display',
		},

		parentId: {
			type: 'integer',
			format: 'int32',
			nullable: true,
			description: 'Parent page ID (for hierarchical pages)',
		},

		lastModified: {
			type: 'string',
			format: 'date-time',
			description: 'Timestamp when the page was last modified',
			readOnly: true,
			example: '2023-10-26T15:51:32.000Z',
		},
	},
};