import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class person extends Model {
		static init(sequelize, DataTypes) {
		return sequelize.define('person', {
				id: {
						autoIncrement: true,
						type: DataTypes.INTEGER,
						allowNull: false,
						primaryKey: true
				},
				email: {
						type: DataTypes.STRING(127),
						allowNull: false,
						defaultValue: "",
						unique: "person_email"
				},
				first: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				middle: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				last: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				gender: {
						type: DataTypes.CHAR(1),
						allowNull: true
				},
				pronoun: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				no_email: {
						type: DataTypes.BOOLEAN,
						allowNull: false,
						defaultValue: 0
				},
				street: {
						type: DataTypes.STRING(127),
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
						type: DataTypes.STRING(15),
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
				tz: {
						type: DataTypes.STRING(63),
						allowNull: true
				},
				phone: {
						type: DataTypes.BIGINT,
						allowNull: true
				},
				site_admin: {
						type: DataTypes.BOOLEAN,
						allowNull: true
				},
				nsda: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				password: {
						type: DataTypes.STRING(128),
						allowNull: true
				},
				accesses: {
						type: DataTypes.INTEGER,
						allowNull: true
				},
				last_access: {
						type: DataTypes.DATE,
						allowNull: true
				},
				pass_timestamp: {
						type: DataTypes.DATE,
						allowNull: true
				},
				timestamp: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				},
				created_at: {
						type: DataTypes.DATE,
						allowNull: false,
						defaultValue: Sequelize.Sequelize.fn('current_timestamp')
				}
		}, {
				tableName: 'person',
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
								name: "person_email",
								unique: true,
								using: "BTREE",
								fields: [
										{ name: "email" },
								]
						},
						{
								name: "email",
								using: "BTREE",
								fields: [
										{ name: "email" },
								]
						},
						{
								name: "noemail",
								using: "BTREE",
								fields: [
										{ name: "no_email" },
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
