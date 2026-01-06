import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class site extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('site', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(127),
						allowNull: false,
						defaultValue: ""
				},
				online: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				directions: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				dropoff: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				host: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				circuit: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'site',
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
