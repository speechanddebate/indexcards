import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class resultValue extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('resultValue', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				value: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				priority: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				result: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'result',
								key: 'id'
						}
				},
				result_key: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				},
				protocol: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'result_value',
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
								name: "result",
								using: "BTREE",
								fields: [
										{ name: "result" },
								]
						},
						{
								name: "result_key",
								using: "BTREE",
								fields: [
										{ name: "result_key" },
								]
						},
				]
		});
		}
}
