import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class room extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('room', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				building: {
						type: DataTypes.STRING(31),
						allowNull: true
				},
				name: {
						type: DataTypes.STRING(127),
						allowNull: false,
						defaultValue: ""
				},
				quality: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				capacity: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				rowcount: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				seats: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				inactive: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				deleted: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				ada: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				notes: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				url: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				password: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				judge_url: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				judge_password: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				api: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				site: {
						type: DataTypes.INTEGER,
						allowNull: true,
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
				tableName: 'room',
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
								name: "uk_room",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "site" },
										{ name: "name" },
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
								name: "api",
								using: "BTREE",
								fields: [
										{ name: "api" },
								]
						},
				]
		});
		}
}
