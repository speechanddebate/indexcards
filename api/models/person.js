const person = (sequelize, DataTypes) => {
	return sequelize.define('person', {
		email: {
			type: DataTypes.STRING(127),
			allowNull: false,
			defaultValue: '',
			validate: {
				isEmail: true,
			},
			unique: true,
		},
		password: {
			type: DataTypes.STRING(127),
			allowNull: true,
		},
		first: {
			type: DataTypes.STRING(63),
			allowNull: true,
		},
		middle: {
			type: DataTypes.STRING(63),
			allowNull: true,
		},
		last: {
			type: DataTypes.STRING(63),
			allowNull: true,
		},
		pronoun: {
			type: DataTypes.STRING(63),
			allowNull: true,
		},
		no_email: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: '0',
		},
		street: {
			type: DataTypes.STRING(127),
			allowNull: true,
		},
		city: {
			type: DataTypes.STRING(63),
			allowNull: true,
		},
		state: {
			type: DataTypes.CHAR(4),
			allowNull: true,
		},
		zip: {
			type: DataTypes.STRING(15),
			allowNull: true,
		},
		postal: {
			type: DataTypes.STRING(15),
			allowNull: true,
		},
		country: {
			type: DataTypes.CHAR(4),
			allowNull: true,
		},
		tz: {
			type: DataTypes.STRING(63),
			allowNull: true,
		},
		phone         : {
			type      : DataTypes.STRING(31),
			allowNull : true,
		},
		pass_timestamp : {
			type       : DataTypes.DATE,
			allowNull  : true,
		},
		site_admin: {
			type         : DataTypes.BOOLEAN,
			allowNull    : false,
			defaultValue : '0',

		},
		nsda: {
			type      : DataTypes.INTEGER(11),
			allowNull : true,
			unique    : true,
		},
		accesses: {
			type         : DataTypes.INTEGER(11),
			allowNull    : false,
			defaultValue : '0',
		},
		last_access   : {
			type      : DataTypes.DATE,
			allowNull : true,
		},
	});
};

export default person;
