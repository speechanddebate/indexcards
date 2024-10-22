const personQuiz = (sequelize, DataTypes) => {
	return sequelize.define('personQuiz', {
		person: {
			type         : DataTypes.INTEGER,
			allowNull    : false,
			defaultValue : '0',
		},
		approved_by: {
			type         : DataTypes.INTEGER,
			allowNull    : true,
		},
		quiz: {
			type         : DataTypes.INTEGER,
			allowNull    : false,
			defaultValue : '0',
		},
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
	},{
		tableName: 'person_quiz',
	});
};

export default personQuiz;
