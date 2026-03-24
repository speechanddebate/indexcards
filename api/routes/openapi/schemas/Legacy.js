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
export const Invite = {
	type : 'object',
	properties : {
		name : { type : 'string', nullable  : true },
	},
};

export const Search = {
	type : 'object',
	properties : {
		result : { type : 'string', nullable  : true },
	},
};
