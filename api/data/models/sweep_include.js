import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class sweepInclude extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('sweepInclude', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				parent: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'sweep_set',
								key: 'id'
						}
				},
				child: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'sweep_set',
								key: 'id'
						}
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'sweep_include',
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
								name: "fk_sweepinclude_parent",
								using: "BTREE",
								fields: [
										{ name: "parent" },
								]
						},
						{
								name: "fk_sweepinclude_child",
								using: "BTREE",
								fields: [
										{ name: "child" },
								]
						},
				]
		});
		}
}
