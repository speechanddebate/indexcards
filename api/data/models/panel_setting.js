import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class panelSetting extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    panel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'panel',
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
    tableName: 'panel_setting',
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
        name: "panel_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "panel" },
          { name: "tag" },
        ]
      },
      {
        name: "uk_panel_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "panel" },
          { name: "tag" },
        ]
      },
      {
        name: "panel",
        using: "BTREE",
        fields: [
          { name: "panel" },
        ]
      },
      {
        name: "setting",
        using: "BTREE",
        fields: [
          { name: "setting" },
        ]
      },
    ]
  });
  }
}
