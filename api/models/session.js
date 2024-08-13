const session = (sequelize, DataTypes) => {
	return sequelize.define('session', {
		userkey: {
			type: DataTypes.STRING(127),
			allowNull: false,
		},
		ip            : {
			type      : DataTypes.STRING(63),
			allowNull : false,
		},
		defaults      : {
			type      : DataTypes.JSON,
			allowNull : true,
		},
		agent_data    : {
			type      : DataTypes.JSON,
			allowNull : true,
		},
		geoip         : {
			type      : DataTypes.JSON,
			allowNull : true,
		},
		push_notify   : {
			type      : DataTypes.STRING(127),
			allowNull : true,
		},
		last_access   : {
			type      : DataTypes.DATE,
			allowNull : true,
		},
	});
};

export default session;
