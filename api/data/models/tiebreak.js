import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tiebreak extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('tiebreak', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				count: {
						type: DataTypes.STRING(15),
						allowNull: false,
						defaultValue: "0"
				},
				count_round: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				truncate: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				truncate_smallest: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				multiplier: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				violation: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				result: {
						type: DataTypes.ENUM('win','loss','split'),
						allowNull: true
				},
				priority: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				chair: {
						type: DataTypes.ENUM('all','chair','nonchair'),
						allowNull: false,
						defaultValue: "all"
				},
				highlow: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				highlow_count: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				highlow_threshold: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				child: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				protocol: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'protocol',
								key: 'id'
						}
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				highlow_target: {
						type: DataTypes.TINYINT,
						allowNull: true
				}
		}, {
				tableName: 'tiebreak',
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
								name: "tiebreak_set",
								using: "BTREE",
								fields: [
										{ name: "protocol" },
								]
						},
				]
		});
		}
}
