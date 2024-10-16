const personQuiz = (sequelize, DataTypes) => {
	return sequelize.define('personQuiz', {
		hidden: {
			type         : DataTypes.BOOLEAN,
			allowNull    : false,
			defaultValue : '0',
		},
		pending: {
			type         : DataTypes.BOOLEAN,
			allowNull    : false,
			defaultValue : '0',
		},
		completed: {
			type         : DataTypes.BOOLEAN,
			allowNull    : false,
			defaultValue : '0',
		},
		answers: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		updated_at: {
			type       : DataTypes.DATE,
			allowNull  : true,
		},
		timestamp: {
			type       : DataTypes.DATE,
			allowNull  : true,
		},
	});
};

export default personQuiz;
