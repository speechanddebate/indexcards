import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class server extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    hostname: {
      type: DataTypes.STRING(127),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('running','built','provisioning','deploying','installing'),
      allowNull: true
    },
    linode_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: "uk_linode_id"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'server',
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
        name: "uk_linode_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "linode_id" },
        ]
      },
      {
        name: "linode_id",
        using: "BTREE",
        fields: [
          { name: "linode_id" },
        ]
      },
    ]
  });
  }
}
