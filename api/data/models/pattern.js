import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class pattern extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('pattern', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(31),
						allowNull: true
				},
				type: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				max: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				exclude: {
						type: DataTypes.TEXT,
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
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'pattern',
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
