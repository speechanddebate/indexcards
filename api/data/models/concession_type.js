import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class concessionType extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('concessionType', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(31),
						allowNull: false
				},
				description: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				concession: {
						type: DataTypes.INTEGER,
						allowNull: false
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
				tableName: 'concession_type',
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
								name: "concession",
								using: "BTREE",
								fields: [
										{ name: "concession" },
								]
						},
				]
		});
		}
}
