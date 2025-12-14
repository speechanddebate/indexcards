import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class setting extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(31),
      allowNull: false
    },
    subtype: {
      type: DataTypes.STRING(31),
      allowNull: false
    },
    tag: {
      type: DataTypes.STRING(31),
      allowNull: false
    },
    value_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    conditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'setting',
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
        name: "tag",
        using: "BTREE",
        fields: [
          { name: "tag" },
        ]
      },
    ]
  });
  }
}
