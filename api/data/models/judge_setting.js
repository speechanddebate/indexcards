import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class judgeSetting extends Model {
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
    judge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'judge',
        key: 'id'
      }
    },
    setting: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    conditional: {
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
    tableName: 'judge_setting',
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
        name: "uk_judge_setting",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "judge" },
          { name: "tag" },
          { name: "conditional" },
        ]
      },
      {
        name: "judge",
        using: "BTREE",
        fields: [
          { name: "judge" },
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
