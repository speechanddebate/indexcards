const coach = (sequelize, DataTypes) => {
	return sequelize.define('coach', {
		nsda: {
			type         : DataTypes.INTEGER(15),
			allowNull    : false,
			defaultValue : '',
		},
		created_at: {
			type      : DataTypes.DATE,
			allowNull : true,
		},
	});
};

export default coach;

