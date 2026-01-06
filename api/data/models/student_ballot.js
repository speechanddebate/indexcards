import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class studentBallot extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('studentBallot', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tag: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				panel: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				},
				entry: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				},
				voter: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				},
				value: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				entered_by: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'student_ballot',
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
								name: "panel",
								using: "BTREE",
								fields: [
										{ name: "panel" },
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
								name: "voter",
								using: "BTREE",
								fields: [
										{ name: "voter" },
								]
						},
				]
		});
		}
}
