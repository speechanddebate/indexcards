import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class chapterSetting extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    chapter: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'chapter',
        key: 'id'
      }
    },
    tag: {
      type: DataTypes.STRING(32),
      allowNull: true
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
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    setting: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'chapter_setting',
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
        name: "chapter",
        using: "BTREE",
        fields: [
          { name: "chapter" },
        ]
      },
    ]
  });
  }
}
