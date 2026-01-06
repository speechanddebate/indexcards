import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class studentVote extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('studentVote', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tag: {
						type: DataTypes.ENUM('nominee','rank','winloss'),
						allowNull: true
				},
				value: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				panel: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'panel',
								key: 'id'
						}
				},
				entry: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'entry',
								key: 'id'
						}
				},
				voter: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				entered_by: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				entered_at: {
						type: DataTypes.DATE,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'student_vote',
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
								name: "sv_evp",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "panel" },
										{ name: "entry" },
										{ name: "voter" },
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
						{
								name: "panel",
								using: "BTREE",
								fields: [
										{ name: "panel" },
								]
						},
				]
		});
		}
}
