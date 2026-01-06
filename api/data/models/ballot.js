import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ballot extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('ballot', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				side: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				speakerorder: {
						type: DataTypes.SMALLINT,
						allowNull: false,
						defaultValue: 0
				},
				seat: {
						type: DataTypes.STRING(6),
						allowNull: true
				},
				chair: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				bye: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				forfeit: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				tv: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				audit: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				approved: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				judge_started: {
						type: DataTypes.DATE,
						allowNull: true
				},
				started_by: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				entered_by: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				audited_by: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				judge: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'judge',
								key: 'id'
						}
				},
				panel: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0,
						references: {
								model: 'panel',
								key: 'id'
						}
				},
				entry: {
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
				tableName: 'ballot',
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
								name: "ballot_ejp",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "entry" },
										{ name: "judge" },
										{ name: "panel" },
								]
						},
						{
								name: "ballot_sideorder",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "panel" },
										{ name: "judge" },
										{ name: "side" },
										{ name: "speakerorder" },
								]
						},
						{
								name: "uk_ballots",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "judge" },
										{ name: "entry" },
										{ name: "panel" },
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
								name: "judge",
								using: "BTREE",
								fields: [
										{ name: "judge" },
								]
						},
						{
								name: "audited_by",
								using: "BTREE",
								fields: [
										{ name: "audited_by" },
								]
						},
						{
								name: "entered_by",
								using: "BTREE",
								fields: [
										{ name: "entered_by" },
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
								name: "started_by",
								using: "BTREE",
								fields: [
										{ name: "started_by" },
								]
						},
				]
		});
		}
}
