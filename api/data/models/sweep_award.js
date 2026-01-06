import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class sweepAward extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('sweepAward', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(127),
						allowNull: false
				},
				description: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				target: {
						type: DataTypes.ENUM('entry','school','individual'),
						allowNull: true
				},
				period: {
						type: DataTypes.ENUM('annual','cumulative'),
						allowNull: true
				},
				count: {
						type: DataTypes.SMALLINT,
						allowNull: false,
						defaultValue: 0
				},
				min_schools: {
						type: DataTypes.SMALLINT,
						allowNull: false,
						defaultValue: 0
				},
				min_entries: {
						type: DataTypes.SMALLINT,
						allowNull: false,
						defaultValue: 0
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
				tableName: 'sweep_award',
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
