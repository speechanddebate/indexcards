import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class category extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('category', {
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
				abbr: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				tourn: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'tourn',
								key: 'id'
						}
				},
				pattern: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				created_at: {
						type: DataTypes.DATE,
						allowNull: true,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'category',
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
						{
								name: "tourn",
								using: "BTREE",
								fields: [
										{ name: "tourn" },
								]
						},
				]
		});
		}
}
