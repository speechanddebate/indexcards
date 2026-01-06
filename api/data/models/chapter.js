import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class chapter extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('chapter', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				name: {
						type: DataTypes.STRING(127),
						allowNull: false,
						defaultValue: ""
				},
				formal: {
						type: DataTypes.STRING(127),
						allowNull: true
				},
				street: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				city: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				state: {
						type: DataTypes.CHAR(4),
						allowNull: true
				},
				zip: {
						type: DataTypes.MEDIUMINT,
						allowNull: true
				},
				postal: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				country: {
						type: DataTypes.CHAR(4),
						allowNull: true
				},
				coaches: {
						type: DataTypes.STRING(255),
						allowNull: true
				},
				self_prefs: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				level: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				nsda: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				district: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				naudl: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				ipeds: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				nces: {
						type: DataTypes.STRING(15),
						allowNull: true
				},
				ceeb: {
						type: DataTypes.STRING(15),
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
				tableName: 'chapter',
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
								name: "nsda_index",
								using: "BTREE",
								fields: [
										{ name: "nsda" },
								]
						},
						{
								name: "nsda",
								using: "BTREE",
								fields: [
										{ name: "nsda" },
								]
						},
				]
		});
		}
}
