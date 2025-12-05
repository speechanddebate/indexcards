import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class jpoolSetting extends Model {
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
      type: DataTypes.STRING(64),
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
    jpool: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'jpool',
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
    tableName: 'jpool_setting',
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
        name: "uk_jpool",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "jpool" },
          { name: "tag" },
        ]
      },
      {
        name: "jpool",
        using: "BTREE",
        fields: [
          { name: "jpool" },
        ]
      },
      {
        name: "jpool_tag",
        using: "BTREE",
        fields: [
          { name: "jpool" },
          { name: "tag" },
        ]
      },
    ]
  });
  }
}
