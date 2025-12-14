import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class message extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(511),
      allowNull: true
    },
    sender_string: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    person: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'person',
        key: 'id'
      }
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tourn',
        key: 'id'
      }
    },
    sender: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    email: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'message',
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
        name: "person",
        using: "BTREE",
        fields: [
          { name: "person" },
        ]
      },
      {
        name: "sender",
        using: "BTREE",
        fields: [
          { name: "sender" },
        ]
      },
      {
        name: "fk_message_tourn",
        using: "BTREE",
        fields: [
          { name: "tourn" },
        ]
      },
    ]
  });
  }
}
