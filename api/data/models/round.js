import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class round extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('round', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				type: {
						type: DataTypes.ENUM('prelim','elim','final','highlow','highhigh','snaked_prelim','runoff'),
						allowNull: false,
						defaultValue: "prelim"
				},
				name: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				label: {
						type: DataTypes.STRING(31),
						allowNull: true
				},
				flighted: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				published: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				post_primary: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				post_secondary: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				post_feedback: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				paired_at: {
						type: DataTypes.DATE,
						allowNull: true
				},
				start_time: {
						type: DataTypes.DATE,
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
				timeslot: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				site: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				protocol: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				runoff: {
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
				tableName: 'round',
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
								name: "uk_round",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "name" },
										{ name: "event" },
								]
						},
						{
								name: "timeslot",
								using: "BTREE",
								fields: [
										{ name: "timeslot" },
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
								name: "tiebreak_set",
								using: "BTREE",
								fields: [
										{ name: "protocol" },
								]
						},
				]
		});
		}
}
