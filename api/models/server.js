const server = (sequelize, DataTypes) => {
	return sequelize.define('server', {
		hostname: {
			type         : DataTypes.STRING(127),
			allowNull    : false,
			defaultValue : '',
		},
		status: {
			type      : DataTypes.ENUM('built', 'deploy', 'ready'),
			allowNull : true,
		},
		linode_id : {
			type      : DataTypes.INTEGER,
			allowNull : true,
		},
		created_at: {
			type      : DataTypes.DATE,
			allowNull : true,
		},
	});
};

export default server;
