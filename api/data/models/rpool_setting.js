import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class rpoolSetting extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('rpoolSetting', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tag: {
						type: DataTypes.STRING(31),
						allowNull: true
				},
				value: {
						type: DataTypes.STRING(63),
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
				rpool: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'rpool',
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
				tableName: 'rpool_setting',
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
								name: "uk_rpool",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "rpool" },
										{ name: "tag" },
								]
						},
						{
								name: "rpool",
								using: "BTREE",
								fields: [
										{ name: "rpool" },
								]
						},
				]
		});
		}
}
