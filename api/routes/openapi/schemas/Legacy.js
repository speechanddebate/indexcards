// From https://coderwall.com/p/jmarug/regex-to-check-for-valid-mysql-datetime-format
// Accepts both YYYY-MM-DD and YYYY-MM-DD HH:mm:ss
const mysqlDate = '^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9])(?:( [0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?$';

export const CaselistLink = {
	type : 'object',
	properties : {
		person_id    : { type : 'integer' },
		slug         : { type : 'string'  , nullable  : true },
		caselist_key : { type : 'string'  , nullable  : true },
		eventcode    : { type : 'integer',  nullable  : true },
	},
};

export const Round = {
	type : 'object',
	properties : {
		id         : { type : 'integer' },
		name       : { type : 'string'  , nullable  : true },
		timestamp  : { type : 'string'  , nullable  : true , pattern : mysqlDate },
	},
};

export const Share = {
	type : 'object',
	properties : {
		panels      : { type : 'array', nullable  : true },
		files       : { type : 'array', nullable  : true },
		from        : { type : 'string' , nullable  : true },
	},
};

export const Student = {
	type               : 'object',
	properties         : {
		id             : { type    : 'integer' },
		first          : { type    : 'string'  , nullable  : true },
		middle         : { type    : 'string'  , nullable  : true },
		last           : { type    : 'string'  , nullable  : true },
		phonetic       : { type    : 'string'  , nullable  : true },
		grad_year      : { type    : 'integer'  , nullable : true },
		novice         : { type    : 'boolean' },
		retired        : { type    : 'boolean' },
		gender         : { type    : 'string'  , nullable  : true },
		diet           : { type    : 'string'  , nullable  : true },
		birthdate      : { type    : 'string'  , nullable  : true , pattern : mysqlDate },
		school_sid     : { type    : 'string'  , nullable  : true },
		race           : { type    : 'string'  , nullable  : true },
		nsda           : { type    : 'integer', nullable   : true },
		chapter        : { type    : 'integer', nullable   : true },
		person         : { type    : 'integer', nullable   : true },
		person_request : { type    : 'integer', nullable   : true },
		timestamp      : { type    : 'string'  , nullable  : true , pattern : mysqlDate },
	},
};

export const Invite = {
	type : 'object',
	properties : {
		name : { type : 'string', nullable  : true },
	},
};

export const Event = {
	type : 'object',
	properties : {
		id       : { type : 'integer' },
		name     : { type : 'string'  , nullable  : true },
		abbr     : { type : 'string'  , nullable  : true },
		type     : { type : 'string'  ,
			nullable  : false,
			enum : ['speech','congress','debate','wudc','wsdc'],
		},
		level    : { type : 'string'  ,
			nullable  : false,
			enum : ['open','jv','novice','champ','es-open','es-novice','middle'],
		},
		fee      : { type : 'number', format: 'float', nullable: true },
		tourn         : { type : 'integer'  , nullable : true },
		category      : { type : 'integer'  , nullable : true },
		pattern       : { type : 'integer'  , nullable : true },
		rating_subset : { type : 'integer'  , nullable : true },
		timestamp     : { type : 'string'  , nullable  : true , pattern : mysqlDate },
	},
};

export const Search = {
	type : 'object',
	properties : {
		result : { type : 'string', nullable  : true },
	},
};

export const Person = {
	type              : 'object',
	properties        : {
		id            : { type    : 'integer' },
		email         : { type    : 'string'  , nullable : true },
		first         : { type    : 'string'  , nullable : true },
		middle        : { type    : 'string'  , nullable : true },
		last          : { type    : 'string'  , nullable : true },
		state         : { type    : 'string'  , nullable : true },
		country       : { type    : 'string'  , nullable : true },
		tz            : { type    : 'string'  , nullable : true },
		nsda          : { type    : 'integer' , nullable : true },
		phone         : { type    : 'integer' , nullable : true },
		gender        : { type    : 'string'  , nullable : true },
		pronoun       : { type    : 'string'  , nullable : true },
		password      : { type    : 'string'  , nullable : false },
		no_email      : { type    : 'boolean' },
		site_admin    : { type    : 'boolean' , nullable : true },
		accesses      : { type    : 'integer' , nullable : true },
		last_access   : { type    : 'string'  , nullable : true , pattern : mysqlDate },
		pass_timestamp: { type    : 'string'  , nullable : true , pattern : mysqlDate },
		timestamp     : { type    : 'string'  , nullable : true , pattern : mysqlDate },
	},
};
