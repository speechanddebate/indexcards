import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class rpoolSetting extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(32),
      allowNull: false
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
    rpool: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'rpool',
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
    tableName: 'rpool_setting',
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
        name: "rpool",
        using: "BTREE",
        fields: [
          { name: "rpool" },
        ]
      },
    ]
  });
  }
}
