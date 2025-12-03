import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class protocolSetting extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tag: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    value: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    value_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    protocol: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'protocol',
        key: 'id'
      }
    },
    value_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    setting: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'protocol_setting',
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
        name: "tiebreak_set_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "protocol" },
          { name: "tag" },
        ]
      },
      {
        name: "tiebreak_set",
        using: "BTREE",
        fields: [
          { name: "protocol" },
        ]
      },
    ]
  });
  }
}
