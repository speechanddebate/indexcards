import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class personSetting extends Model {
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
    person: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'person',
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
    tableName: 'person_setting',
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
        name: "uk_account_setting",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "person" },
          { name: "tag" },
        ]
      },
      {
        name: "person_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "person" },
          { name: "tag" },
        ]
      },
      {
        name: "person",
        using: "BTREE",
        fields: [
          { name: "person" },
        ]
      },
      {
        name: "tag",
        using: "BTREE",
        fields: [
          { name: "tag" },
          { name: "person" },
        ]
      },
    ]
  });
  }
}
