import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tournSite extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('tournSite', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tourn: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'tourn',
								key: 'id'
						}
				},
				site: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0,
						references: {
								model: 'site',
								key: 'id'
						}
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'tourn_site',
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
								name: "tourn_site_unique",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "tourn" },
										{ name: "site" },
								]
						},
						{
								name: "site",
								using: "BTREE",
								fields: [
										{ name: "site" },
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
