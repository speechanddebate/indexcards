import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class protocol extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tourn',
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
    tableName: 'protocol',
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
        name: "tiebreak_tourn",
        using: "BTREE",
        fields: [
          { name: "tourn" },
        ]
      },
    ]
  });
  }
}
