import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class entryStudent extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('entryStudent', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				entry: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'entry',
								key: 'id'
						}
				},
				student: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0,
						references: {
								model: 'student',
								key: 'id'
						}
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				created_at: {
						type: DataTypes.DATE,
						allowNull: true
				}
		}, {
				tableName: 'entry_student',
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
								name: "uk_entry_student",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "entry" },
										{ name: "student" },
								]
						},
						{
								name: "entry",
								using: "BTREE",
								fields: [
										{ name: "entry" },
								]
						},
						{
								name: "student",
								using: "BTREE",
								fields: [
										{ name: "student" },
								]
						},
				]
		});
		}
}
