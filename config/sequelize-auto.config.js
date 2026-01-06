
const autoConfig = {

	// You only should set these if they are different from what's in your
	// overall configuration.
	// user    : 'username',
	// pass    : 'superSecurePassword',
	// dbname  : 'tabroom',

	options : {

		dialect         : 'mariadb',
		lang            : 'esm',
		freezeTableName : true,
		modelName       : 'singularName',
		underscored     : true,
		caseModel       : 'c',
		spaces          : false,
		skipTables      : ['stats', 'housing', 'housing_slots'],
		singularize     : true,
		directory       : './api/data/models',
		useDefine       : true,
		logging         : false,

		additional      : {
			timestamps : false,
		}
	},
}

export default autoConfig;
