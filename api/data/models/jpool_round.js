import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class jpoolRound extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    jpool: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'jpool',
        key: 'id'
      }
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    tableName: 'jpool_round',
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
        name: "jpool",
        using: "BTREE",
        fields: [
          { name: "jpool" },
        ]
      },
    ]
  });
  }
}
