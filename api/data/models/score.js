import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class score extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('score', {
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
				value: {
						type: DataTypes.FLOAT,
						allowNull: false,
						defaultValue: 0
				},
				content: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				topic: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				speech: {
						type: DataTypes.SMALLINT,
						allowNull: false,
						defaultValue: 0
				},
				position: {
						type: DataTypes.TINYINT,
						allowNull: false,
						defaultValue: 0
				},
				ballot: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'ballot',
								key: 'id'
						}
				},
				student: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				tiebreak: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				cat_id: {
						type: DataTypes.INTEGER,
						allowNull: true
				}
		}, {
				tableName: 'score',
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
								name: "uk_score_restraint",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "tag" },
										{ name: "ballot" },
										{ name: "speech" },
										{ name: "position" },
										{ name: "student" },
								]
						},
						{
								name: "student",
								using: "BTREE",
								fields: [
										{ name: "student" },
								]
						},
						{
								name: "ballot",
								using: "BTREE",
								fields: [
										{ name: "ballot" },
								]
						},
						{
								name: "tags",
								using: "BTREE",
								fields: [
										{ name: "ballot" },
										{ name: "tag" },
								]
						},
				]
		});
		}
}
