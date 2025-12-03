import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class eventSetting extends Model {
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
    event: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'event',
        key: 'id'
      }
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
    tableName: 'event_setting',
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
        name: "event_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "event" },
          { name: "tag" },
        ]
      },
      {
        name: "uk_event_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "event" },
          { name: "tag" },
        ]
      },
      {
        name: "event",
        using: "BTREE",
        fields: [
          { name: "event" },
        ]
      },
      {
        name: "tag_value",
        using: "BTREE",
        fields: [
          { name: "tag" },
          { name: "value" },
        ]
      },
      {
        name: "tag",
        using: "BTREE",
        fields: [
          { name: "tag" },
        ]
      },
      {
        name: "estag",
        using: "BTREE",
        fields: [
          { name: "tag" },
          { name: "event" },
        ]
      },
    ]
  });
  }
}
