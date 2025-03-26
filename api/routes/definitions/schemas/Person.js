import { mysqlDate } from '../formats.js';

const Person = {
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
		accesess      : { type    : 'integer' , nullable : true },
		last_access   : { type    : 'string'  , nullable : true , pattern : mysqlDate },
		pass_timstamp : { type    : 'string'  , nullable : true , pattern : mysqlDate },
		timestamp     : { type    : 'string'  , nullable : true , pattern : mysqlDate },
	},
};

export default Person;
