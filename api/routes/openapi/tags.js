//Try to keep tags in alphabetical order
export const tags = [
	{
		name: 'Admin : Servers',
		description: 'Administrative functions for managing Tabroom servers',
	},
	{
		name: 'Admin : Mail',
		description: 'Administrative functions for testing mail and notifications',
	},
	{
		name: 'ads',
		description: 'Endpoints related to advertisements displayed on Tabroom',
	},
	{
		name: 'Auth',
		description: 'Authentication related endpoints',
	},
	{
		name: 'Backup and Restore',
		description: 'Endpoints for managing tournament backups and restores',
	},
	{
		name: 'Ext : Caselist',
		description: 'Endpoints for external access to Caselist data',
	},
	{
		name: 'Ext : Share',
		description: 'Endpoints for external access to Share data',
	},
	{
		name: 'Ext : NSDA',
		description: 'Endpoints for external access to NSDA data',
	},
	{
		name: 'Ext : Mason',
		description: 'Endpoints for external access to Mason data',
	},
	{
		name: 'Tourn',
		description: 'Endpoints for managing tournaments',
	},
	{
		name: 'Category',
		description: 'Endpoints for managing categories within tournaments',
	},
	{
		name: 'Sites & Rooms',
		description: 'Endpoints for managing sites and rooms within tournaments',
	},
	{
		name: 'Schools',
		description: 'Endpoints for managing schools within tournaments',
	},
	{
		name: 'Tournaments',
	},
];

export const declaredTagGroups = [
	{
		name: 'Admin',
		tags: [
			'Admin : Servers',
			'Admin : Mail',
		],
	},
	{
		name: 'Ext',
		tags: [
			'Ext',
			'Ext : Caselist',
			'Ext : Share',
			'Ext : NSDA',
			'Ext : Mason',
		],
	},
	{
		name: 'Tournament Management',
		tags: [
			'Tourn',
			'Backup and Restore',
			'Category',
			'Sites & Rooms',
			'Schools',
		],
	},
];