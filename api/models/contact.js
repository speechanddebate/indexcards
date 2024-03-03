const contact = (sequelize, DataTypes) => {
	return sequelize.define('contact', {
		official: {
			type         : DataTypes.BOOLEAN,
			allowNull    : false,
			defaultValue : '0',
		},
		onsite: {
			type         : DataTypes.BOOLEAN,
			allowNull    : false,
			defaultValue : '0',
		},
		email: {
			type         : DataTypes.BOOLEAN,
			allowNull    : false,
			defaultValue : '0',
		},
		no_book: {
			type         : DataTypes.BOOLEAN,
			allowNull    : false,
			defaultValue : '0',
		},
		created_at: {
			type      : DataTypes.DATE,
			allowNull : true,
		},
	});
};

export default contact;
