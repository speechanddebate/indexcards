import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tournIgnore extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('tournIgnore', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tourn: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'tourn',
								key: 'id'
						}
				},
				person: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'person',
								key: 'id'
						}
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'tourn_ignore',
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
						{
								name: "person",
								using: "BTREE",
								fields: [
										{ name: "person" },
								]
						},
				]
		});
		}
}
