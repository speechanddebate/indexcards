import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class file extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('file', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tag: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				type: {
						type: DataTypes.STRING(16),
						allowNull: true
				},
				label: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				filename: {
						type: DataTypes.STRING(127),
						allowNull: true
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
				page_order: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				uploaded: {
						type: DataTypes.DATE,
						allowNull: true
				},
				bill_category: {
						type: DataTypes.STRING(63),
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
				entry: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				event: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				district: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				circuit: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				webpage: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				parent: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				person: {
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
				tableName: 'file',
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
								name: "school",
								using: "BTREE",
								fields: [
										{ name: "school" },
								]
						},
						{
								name: "district",
								using: "BTREE",
								fields: [
										{ name: "district" },
								]
						},
						{
								name: "fk_file_tourn",
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
				]
		});
		}
}
