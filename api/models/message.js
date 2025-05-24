const message = (sequelize, DataTypes) => {
	return sequelize.define('message', {
		subject: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		body: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		from: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		url: {
			type: DataTypes.STRING(511),
			allowNull: true,
		},
		sender_string: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		created_at: {
			type      : DataTypes.DATE,
			allowNull : true,
		},
		read_at: {
			type      : DataTypes.DATE,
			allowNull : true,
		},
		deleted_at: {
			type      : DataTypes.DATE,
			allowNull : true,
		},
	});
};

export default message;
