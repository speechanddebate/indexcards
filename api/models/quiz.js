const quiz = (sequelize, DataTypes) => {
	return sequelize.define('quiz', {
		letter: {
			type: DataTypes.STRING(3),
			allowNull: true,
		},
		flight: {
			type: DataTypes.STRING(3),
			allowNull: true,
		},
		bye: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: '0',
		},
		nsda_course: {
			type         : DataTypes.INTEGER(11),
			allowNull    : true,
		},
		bracket: {
			type: DataTypes.INTEGER(6),
			allowNull: false,
			defaultValue: '0',
		},
		publish: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: '0',
		},
	});
};

export default quiz;
