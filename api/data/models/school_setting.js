import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class schoolSetting extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('schoolSetting', {
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
				school: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'school',
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
				},
				last_changed: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				chapter: {
						type: DataTypes.INTEGER,
						allowNull: true
				}
		}, {
				tableName: 'school_setting',
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
								name: "school_tag",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "school" },
										{ name: "tag" },
								]
						},
						{
								name: "school",
								using: "BTREE",
								fields: [
										{ name: "school" },
								]
						},
				]
		});
		}
}
