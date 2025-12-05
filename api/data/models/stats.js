import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class stats extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    tag: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    value: {
      type: DataTypes.DECIMAL(8,2),
      allowNull: true
    },
    event: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'stats',
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
        name: "event",
        using: "BTREE",
        fields: [
          { name: "event" },
        ]
      },
    ]
  });
  }
}
