import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class event extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('event', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				abbr: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				type: {
						type: DataTypes.ENUM('speech','congress','debate','wudc','wsdc','attendee','mock_trial'),
						allowNull: false,
						defaultValue: "attendee"
				},
				level: {
						type: DataTypes.ENUM('open','jv','novice','champ','es-open','es-novice','middle'),
						allowNull: false,
						defaultValue: "open"
				},
				fee: {
						type: DataTypes.DECIMAL(8,2),
						allowNull: true
				},
				tourn: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				category: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'category',
								key: 'id'
						}
				},
				pattern: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				rating_subset: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				nsda_category: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
							model: 'nsda_category',
							key: 'id',
						}
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
				tableName: 'event',
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
								name: "event_abbr",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "abbr" },
										{ name: "tourn" },
								]
						},
						{
								name: "event_name",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "name" },
										{ name: "tourn" },
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
								name: "category",
								using: "BTREE",
								fields: [
										{ name: "category" },
								]
						},
				]
		});
		}
}
