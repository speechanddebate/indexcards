const sweepAward = (sequelize, DataTypes) => {
	return sequelize.define('sweepAward', {
		name: {
			type: DataTypes.STRING(127),
			allowNull: false,
			defaultValue: '',
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		target : {
			type: DataTypes.ENUM('entry', 'school', 'individual'),
			allowNull: true,
		},
		period : {
			type: DataTypes.ENUM('annual', 'cumulative'),
			allowNull: true,
		},
		count: {
			type: DataTypes.INTEGER(6),
			allowNull: true,
		},
		min_schools: {
			type: DataTypes.INTEGER(6),
			allowNull: true,
		},
		min_entries: {
			type: DataTypes.INTEGER(6),
			allowNull: true,
		},
	}, {
		tableName: 'sweep_award',
	});
};

export default sweepAward;
