import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class settingLabel extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('settingLabel', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				lang: {
						type: DataTypes.CHAR(2),
						allowNull: true
				},
				label: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				guide: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				options: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				setting: {
						type: DataTypes.INTEGER,
						allowNull: false,
						references: {
								model: 'setting',
								key: 'id'
						}
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'setting_label',
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
								name: "fk_setting_label",
								using: "BTREE",
								fields: [
										{ name: "setting" },
								]
						},
				]
		});
		}
}
