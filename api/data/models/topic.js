import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class topic extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('topic', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				tag: {
						type: DataTypes.STRING(31),
						allowNull: true
				},
				source: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				event_type: {
						type: DataTypes.STRING(31),
						allowNull: true
				},
				pattern: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				topic_text: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				school_year: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				sort_order: {
						type: DataTypes.SMALLINT,
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
				},
				created_by: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				}
		}, {
				tableName: 'topic',
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
				]
		});
		}
}
