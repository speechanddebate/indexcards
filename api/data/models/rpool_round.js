import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class rpoolRound extends Model {
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
    round: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'round',
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
    tableName: 'rpool_round',
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
        name: "round",
        using: "BTREE",
        fields: [
          { name: "round" },
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
