import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class entry extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('entry', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				code: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				name: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				ada: {
						type: DataTypes.BOOLEAN,
						allowNull: true
				},
				active: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				dropped: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				waitlist: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				unconfirmed: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				tourn: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				school: {
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
				registered_by: {
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
				tableName: 'entry',
				hasTrigger: true,
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
								name: "tournament",
								using: "BTREE",
								fields: [
										{ name: "tourn" },
										{ name: "school" },
								]
						},
						{
								name: "tournament_2",
								using: "BTREE",
								fields: [
										{ name: "tourn" },
										{ name: "school" },
										{ name: "event" },
								]
						},
						{
								name: "code",
								using: "BTREE",
								fields: [
										{ name: "code" },
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
								name: "id",
								using: "BTREE",
								fields: [
										{ name: "id" },
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
								name: "registered_by",
								using: "BTREE",
								fields: [
										{ name: "registered_by" },
								]
						},
				]
		});
		}
}
