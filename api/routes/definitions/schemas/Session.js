// This object is incomplete until a real login controller is implemented
const Session = {
	type : 'object',
	properties : {
		person_id   : { type : 'integer' } ,
		name        : { type : 'string'  } ,
		defaults    : { type : 'object' }  ,
		last_access : { type : Date }      ,

	},
};

export default Session;
