import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class result extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('result', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				rank: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				place: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				percentile: {
						type: DataTypes.DECIMAL(6,2),
						allowNull: true
				},
				honor: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				honor_site: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				result_set: {
						type: DataTypes.INTEGER,
						allowNull: true
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
						allowNull: true,
						references: {
								model: 'student',
								key: 'id'
						}
				},
				school: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'school',
								key: 'id'
						}
				},
				round: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				panel: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				details: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				raw_scores: {
						type: DataTypes.TEXT,
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
				tableName: 'result',
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
						{
								name: "result_set",
								using: "BTREE",
								fields: [
										{ name: "result_set" },
								]
						},
						{
								name: "round",
								using: "BTREE",
								fields: [
										{ name: "round" },
								]
						},
						{
								name: "fk_school",
								using: "BTREE",
								fields: [
										{ name: "school" },
								]
						},
				]
		});
		}
}
