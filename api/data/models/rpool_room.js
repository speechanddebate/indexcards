import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class rpoolRoom extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rpool: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'rpool',
        key: 'id'
      }
    },
    room: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'room',
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
    tableName: 'rpool_room',
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
        name: "room",
        using: "BTREE",
        fields: [
          { name: "room" },
        ]
      },
      {
        name: "room_group",
        using: "BTREE",
        fields: [
          { name: "rpool" },
        ]
      },
    ]
  });
  }
}
