import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class concession extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('concession', {
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
				price: {
						type: DataTypes.DECIMAL(8,2),
						allowNull: true
				},
				description: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				deadline: {
						type: DataTypes.DATE,
						allowNull: true
				},
				cap: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				school_cap: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				billing_code: {
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
				tableName: 'concession',
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
								name: "fk_concession_tourn",
								using: "BTREE",
								fields: [
										{ name: "tourn" },
								]
						},
				]
		});
		}
}
