import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tabroomSetting extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('tabroomSetting', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tag: {
						type: DataTypes.STRING(31),
						allowNull: false,
						defaultValue: "",
						unique: "uk_tabroom_setting"
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
				person: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'tabroom_setting',
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
								name: "uk_tabroom_setting",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "tag" },
								]
						},
						{
								name: "person",
								using: "BTREE",
								fields: [
										{ name: "person" },
								]
						},
				]
		});
		}
}
