import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class practice extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('practice', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				chapter: {
						type: DataTypes.INTEGER,
						allowNull: false,
						references: {
								model: 'chapter',
								key: 'id'
						}
				},
				name: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				tag: {
						type: DataTypes.STRING(31),
						allowNull: true
				},
				start: {
						type: DataTypes.DATE,
						allowNull: true
				},
				end: {
						type: DataTypes.DATE,
						allowNull: true
				},
				reported: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
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
				},
				created_by: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				}
		}, {
				tableName: 'practice',
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
								name: "chapter",
								using: "BTREE",
								fields: [
										{ name: "chapter" },
								]
						},
						{
								name: "created_by",
								using: "BTREE",
								fields: [
										{ name: "created_by" },
								]
						},
				]
		});
		}
}
