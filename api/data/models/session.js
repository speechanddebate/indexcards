import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class session extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('session', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				userkey: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				ip: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				defaults: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				su: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				person: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'person',
								key: 'id'
						}
				},
				agent_data: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				geoip: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				push_notify: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				push_active: {
						type: DataTypes.DATE,
						allowNull: true
				},
				last_access: {
						type: DataTypes.DATE,
						allowNull: true
				},
				created_at: {
						type: DataTypes.DATE,
						allowNull: true,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'session',
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
								name: "userkey",
								using: "BTREE",
								fields: [
										{ name: "userkey" },
								]
						},
						{
								name: "fk_session_person",
								using: "BTREE",
								fields: [
										{ name: "person" },
								]
						},
				]
		});
		}
}
