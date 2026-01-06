import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tournFee extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('tournFee', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				start: {
						type: DataTypes.DATE,
						allowNull: true
				},
				end: {
						type: DataTypes.DATE,
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
				amount: {
						type: DataTypes.DECIMAL(8,2),
						allowNull: true
				},
				reason: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'tourn_fee',
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
				]
		});
		}
}
