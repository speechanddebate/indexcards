const hotel = (sequelize, DataTypes) => {
	return sequelize.define('hotel', {
		name: {
			type: DataTypes.STRING(63),
			allowNull: false,
			defaultValue: '',
		},
		multiple: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		surcharge: {
			type: DataTypes.FLOAT,
			allowNull: true,
		},
		no_confirm: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
		tourn_default: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
		},
	});
};

export default hotel;
