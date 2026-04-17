import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class roundSetting extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('roundSetting', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tag: {
						type: DataTypes.STRING(32),
						allowNull: false
				},
				value: {
						type: DataTypes.STRING(64),
						allowNull: true
				},
				value_text: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				value_date: {
						type: DataTypes.DATE,
						allowNull: true
				},
				round: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'round',
								key: 'id'
						}
				},
				setting: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'round_setting',
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
								name: "round_tag",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "round" },
										{ name: "tag" },
								]
						},
						{
								name: "round",
								using: "BTREE",
								fields: [
										{ name: "round" },
								]
						},
				]
		});
		}
}
