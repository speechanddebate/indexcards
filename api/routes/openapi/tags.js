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
		name: 'ads',
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
			'Ext : Caselist',
			'Ext : Share',
			'Ext : NSDA',
			'Ext : Mason',
		],
	},
];