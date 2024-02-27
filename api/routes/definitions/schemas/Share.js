const Share = {
	type : 'object',
	properties : {
		panels      : { type : 'array', nullable  : true },
		files       : { type : 'array', nullable  : true },
		from        : { type : 'string' , nullable  : true },
	},
};

export default Share;
