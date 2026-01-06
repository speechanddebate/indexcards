import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class circuitSetting extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('circuitSetting', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				circuit: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0,
						references: {
								model: 'circuit',
								key: 'id'
						}
				},
				tag: {
						type: DataTypes.STRING(31),
						allowNull: false,
						defaultValue: ""
				},
				value: {
						type: DataTypes.STRING(127),
						allowNull: false,
						defaultValue: ""
				},
				value_text: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				value_date: {
						type: DataTypes.DATE,
						allowNull: true
				},
				setting: {
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
				tableName: 'circuit_setting',
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
								name: "uk_circuit_setting",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "circuit" },
										{ name: "tag" },
								]
						},
						{
								name: "circuit",
								using: "BTREE",
								fields: [
										{ name: "circuit" },
								]
						},
				]
		});
		}
}
