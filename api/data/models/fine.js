import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class fine extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('fine', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				reason: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				amount: {
						type: DataTypes.DECIMAL(8,2),
						allowNull: true
				},
				payment: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				levied_at: {
						type: DataTypes.DATE,
						allowNull: true
				},
				levied_by: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				deleted: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				deleted_at: {
						type: DataTypes.DATE,
						allowNull: true
				},
				deleted_by: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				tourn: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'tourn',
								key: 'id'
						}
				},
				school: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				region: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				judge: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				person: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				parent: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				invoice: {
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
				tableName: 'fine',
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
								name: "school",
								using: "BTREE",
								fields: [
										{ name: "school" },
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
								name: "levied_by",
								using: "BTREE",
								fields: [
										{ name: "levied_by" },
								]
						},
						{
								name: "judge",
								using: "BTREE",
								fields: [
										{ name: "judge" },
								]
						},
				]
		});
		}
}
