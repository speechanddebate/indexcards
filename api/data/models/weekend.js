import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class weekend extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('weekend', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(64),
						allowNull: false
				},
				start: {
						type: DataTypes.DATE,
						allowNull: false
				},
				end: {
						type: DataTypes.DATE,
						allowNull: false
				},
				reg_start: {
						type: DataTypes.DATE,
						allowNull: false
				},
				reg_end: {
						type: DataTypes.DATE,
						allowNull: false
				},
				freeze_deadline: {
						type: DataTypes.DATE,
						allowNull: false
				},
				drop_deadline: {
						type: DataTypes.DATE,
						allowNull: false
				},
				judge_deadline: {
						type: DataTypes.DATE,
						allowNull: false
				},
				fine_deadline: {
						type: DataTypes.DATE,
						allowNull: false
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
						allowNull: true
				},
				city: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				state: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'weekend',
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
