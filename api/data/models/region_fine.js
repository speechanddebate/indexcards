import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class regionFine extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('regionFine', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				amount: {
						type: DataTypes.FLOAT,
						allowNull: true
				},
				reason: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				levied_at: {
						type: DataTypes.DATE,
						allowNull: true
				},
				levied_by: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				tourn: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				region: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				school: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'region_fine',
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
