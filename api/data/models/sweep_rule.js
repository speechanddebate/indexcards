import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class sweepRule extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('sweepRule', {
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
				place: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				count: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				rev_min: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				count_round: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				truncate: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				sweep_set: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'sweep_set',
								key: 'id'
						}
				},
				protocol: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'sweep_rule',
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
								name: "sweep_set",
								using: "BTREE",
								fields: [
										{ name: "sweep_set" },
								]
						},
				]
		});
		}
}
