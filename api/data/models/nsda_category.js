import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class nsdaCategory extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('nsdaCategory', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(31),
						allowNull: true
				},
				type: {
						type: DataTypes.ENUM('s','d','c'),
						allowNull: true
				},
				code: {
						type: DataTypes.SMALLINT,
						allowNull: true
				},
				national: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'nsda_category',
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
