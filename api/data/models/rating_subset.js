import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ratingSubset extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('ratingSubset', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				category: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'rating_subset',
				timestamps: false,
				indexes: [
						{
								name: "PRIMARY",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "id" },
								]
						},
				]
		});
		}
}
