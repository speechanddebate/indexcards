import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class hotel extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('hotel', {
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
				multiple: {
						type: DataTypes.FLOAT,
						allowNull: true
				},
				surcharge: {
						type: DataTypes.FLOAT,
						allowNull: true
				},
				no_confirm: {
						type: DataTypes.BOOLEAN,
						allowNull: true
				},
				tourn_default: {
						type: DataTypes.BOOLEAN,
						allowNull: true
				},
				tourn: {
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
				tableName: 'hotel',
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
