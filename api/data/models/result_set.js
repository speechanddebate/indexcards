import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class resultSet extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('resultSet', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tag: {
						type: DataTypes.ENUM('final','bracket','seed','speaker','qualifier','sweep','toc','nsda','table','chamber','other'),
						allowNull: true
				},
				label: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				bracket: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				published: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				coach: {
						type: DataTypes.BOOLEAN,
						allowNull: true
				},
				generated: {
						type: DataTypes.DATE,
						allowNull: true
				},
				cache: {
						type: DataTypes.TEXT,
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
				sweep_set: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				sweep_award: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				event: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'event',
								key: 'id'
						}
				},
				nsda_category: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'nsda_category',
								key: 'id'
						}
				},
				circuit: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				code: {
						type: DataTypes.STRING(15),
						allowNull: true
				}
		}, {
				tableName: 'result_set',
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
								name: "tourn",
								using: "BTREE",
								fields: [
										{ name: "tourn" },
								]
						},
						{
								name: "event",
								using: "BTREE",
								fields: [
										{ name: "event" },
								]
						},
						{
								name: "result_labels",
								using: "BTREE",
								fields: [
										{ name: "label" },
										{ name: "event" },
								]
						},
						{
								name: "fk_rs_nsda_category",
								using: "BTREE",
								fields: [
										{ name: "nsda_category" },
								]
						},
				]
		});
		}
}
