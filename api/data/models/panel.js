import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class panel extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('panel', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				letter: {
						type: DataTypes.STRING(3),
						allowNull: true
				},
				flight: {
						type: DataTypes.STRING(3),
						allowNull: true
				},
				bye: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				started: {
						type: DataTypes.DATE,
						allowNull: true
				},
				bracket: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				publish: {
						type: DataTypes.BOOLEAN,
						allowNull: true
				},
				room: {
						type: DataTypes.INTEGER,
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
				tableName: 'panel',
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
								name: "room",
								using: "BTREE",
								fields: [
										{ name: "room" },
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
