import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class quiz extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('quiz', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tag: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				label: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				questions: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				description: {
						type: DataTypes.STRING(511),
						allowNull: true
				},
				sitewide: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				hidden: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				approval: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				show_answers: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				admin_only: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				badge: {
						type: DataTypes.STRING(511),
						allowNull: true
				},
				badge_link: {
						type: DataTypes.STRING(511),
						allowNull: true
				},
				badge_description: {
						type: DataTypes.STRING(511),
						allowNull: true
				},
				person: {
						type: DataTypes.INTEGER,
						allowNull: false
				},
				tourn: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'tourn',
								key: 'id'
						}
				},
				circuit: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				nsda_course: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				created_at: {
						type: DataTypes.DATE,
						allowNull: true,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'quiz',
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
								name: "person",
								using: "BTREE",
								fields: [
										{ name: "person" },
								]
						},
						{
								name: "fk_quiz_tourn",
								using: "BTREE",
								fields: [
										{ name: "tourn" },
								]
						},
						{
								name: "fk_quiz_circuit",
								using: "BTREE",
								fields: [
										{ name: "circuit" },
								]
						},
				]
		});
		}
}
