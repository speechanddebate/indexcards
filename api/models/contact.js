const contact = (sequelize, DataTypes) => {
	return sequelize.define('contact', {
		tag: {
			type         : DataTypes.STRING(15),
			allowNull    : false,
			defaultValue : '',
		},
		created_at: {
			type      : DataTypes.DATE,
			allowNull : true,
		},
	});
};

export default contact;
