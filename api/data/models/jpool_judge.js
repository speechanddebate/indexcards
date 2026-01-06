import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class jpoolJudge extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('jpoolJudge', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				judge: {
						type: DataTypes.INTEGER,
						allowNull: false,
						defaultValue: 0,
						references: {
								model: 'judge',
								key: 'id'
						}
				},
				jpool: {
						type: DataTypes.INTEGER,
						allowNull: true,
						references: {
								model: 'jpool',
								key: 'id'
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
				tableName: 'jpool_judge',
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
								name: "pool",
								using: "BTREE",
								fields: [
										{ name: "jpool" },
								]
						},
						{
								name: "judge",
								using: "BTREE",
								fields: [
										{ name: "judge" },
								]
						},
				]
		});
		}
}
