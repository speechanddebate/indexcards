import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class rating extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('rating', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				type: {
						type: DataTypes.ENUM('school','entry','coach'),
						allowNull: true
				},
				entered: {
						type: DataTypes.DATE,
						allowNull: true
				},
				ordinal: {
						type: DataTypes.SMALLINT,
						allowNull: false,
						defaultValue: 0
				},
				percentile: {
						type: DataTypes.DECIMAL(8,2),
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
				rating_tier: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0
				},
				judge: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'judge',
								key: 'id'
						}
				},
				rating_subset: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				side: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'rating',
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
								name: "judge_entry",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "entry" },
										{ name: "judge" },
										{ name: "side" },
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
								name: "judge",
								using: "BTREE",
								fields: [
										{ name: "judge" },
								]
						},
						{
								name: "rating_tier",
								using: "BTREE",
								fields: [
										{ name: "rating_tier" },
								]
						},
				]
		});
		}
}
