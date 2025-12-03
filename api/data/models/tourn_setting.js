import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tournSetting extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'tourn',
        key: 'id'
      }
    },
    tag: {
      type: DataTypes.STRING(31),
      allowNull: false,
      defaultValue: ""
    },
    value: {
      type: DataTypes.STRING(127),
      allowNull: false,
      defaultValue: ""
    },
    value_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    value_date: {
      type: DataTypes.DATE,
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
    tableName: 'tourn_setting',
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
        name: "uk_tourn_setting",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "tourn" },
          { name: "tag" },
        ]
      },
      {
        name: "tourn_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "tourn" },
          { name: "tag" },
        ]
      },
      {
        name: "tourn",
        using: "BTREE",
        fields: [
          { name: "tourn" },
        ]
      },
      {
        name: "tags",
        using: "BTREE",
        fields: [
          { name: "tag" },
          { name: "tourn" },
        ]
      },
    ]
  });
  }
}
