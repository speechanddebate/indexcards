import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class judge extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('judge', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				code: {
						type: DataTypes.STRING(8),
						allowNull: true
				},
				first: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				middle: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				last: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				active: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				ada: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				obligation: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				hired: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				school: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				},
				category: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'category',
								key: 'id'
						}
				},
				alt_category: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				covers: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				chapter_judge: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				person: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				},
				person_request: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				score: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				tmp: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				created_at: {
						type: DataTypes.DATE,
						allowNull: true,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'judge',
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
								name: "id",
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
								name: "chapter_judge",
								using: "BTREE",
								fields: [
										{ name: "chapter_judge" },
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
								name: "category",
								using: "BTREE",
								fields: [
										{ name: "category" },
								]
						},
						{
								name: "alt",
								using: "BTREE",
								fields: [
										{ name: "alt_category" },
								]
						},
				]
		});
		}
}
