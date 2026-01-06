import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class district extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('district', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(64),
						allowNull: true
				},
				code: {
						type: DataTypes.STRING(16),
						allowNull: true,
						unique: "code"
				},
				location: {
						type: DataTypes.STRING(16),
						allowNull: true
				},
				chair: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				level: {
						type: DataTypes.TINYINT,
						allowNull: true
				},
				region: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				realm: {
						type: DataTypes.STRING(8),
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				financials: {
						type: DataTypes.TEXT,
						allowNull: true
				},
				created_at: {
						type: DataTypes.DATE,
						allowNull: true,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'district',
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
								name: "code",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "code" },
								]
						},
				]
		});
		}
}
