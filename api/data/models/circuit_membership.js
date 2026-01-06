import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class circuitMembership extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('circuitMembership', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(64),
						allowNull: true
				},
				approval: {
						type: DataTypes.BOOLEAN,
						allowNull: true
				},
				description: {
						type: DataTypes.STRING(127),
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
				},
				created_at: {
						type: DataTypes.DATE,
						allowNull: true,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'circuit_membership',
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
				]
		});
		}
}
