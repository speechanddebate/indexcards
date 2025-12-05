import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class login extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(63),
      allowNull: false,
      unique: "login_username"
    },
    password: {
      type: DataTypes.STRING(63),
      allowNull: true
    },
    sha512: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    accesses: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    last_access: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pass_timestamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    pass_changekey: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    pass_change_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    source: {
      type: DataTypes.CHAR(4),
      allowNull: true
    },
    person: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'person',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'login',
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
        name: "login_username",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "username" },
        ]
      },
      {
        name: "person",
        using: "BTREE",
        fields: [
          { name: "person" },
        ]
      },
    ]
  });
  }
}
