import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class jpool extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('jpool', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				category: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'category',
								key: 'id'
						}
				},
				site: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				},
				parent: {
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
				tableName: 'jpool',
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
								name: "category",
								using: "BTREE",
								fields: [
										{ name: "category" },
								]
						},
						{
								name: "parent",
								using: "BTREE",
								fields: [
										{ name: "parent" },
								]
						},
				]
		});
		}
}
