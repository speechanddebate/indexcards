import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class studentSetting extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    student: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'student',
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
    setting: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'student_setting',
    timestamps: true,
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
        name: "student_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student" },
          { name: "tag" },
        ]
      },
      {
        name: "student",
        using: "BTREE",
        fields: [
          { name: "student" },
        ]
      },
    ]
  });
  }
}
