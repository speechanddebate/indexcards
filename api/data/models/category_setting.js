import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class categorySetting extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('categorySetting', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				category: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'category',
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
				tableName: 'category_setting',
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
								name: "uk_judge_group_setting",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "category" },
										{ name: "tag" },
								]
						},
						{
								name: "category",
								using: "BTREE",
								fields: [
										{ name: "category" },
								]
						},
						{
								name: "category_tag",
								using: "BTREE",
								fields: [
										{ name: "category" },
										{ name: "tag" },
								]
						},
				]
		});
		}
}
