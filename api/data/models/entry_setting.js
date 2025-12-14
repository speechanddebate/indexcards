import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class entrySetting extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tag: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    value: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    value_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    value_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    entry: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'entry',
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
    tableName: 'entry_setting',
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
        name: "entry_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "entry" },
          { name: "tag" },
        ]
      },
      {
        name: "entry",
        using: "BTREE",
        fields: [
          { name: "entry" },
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
