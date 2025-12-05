import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class regionSetting extends Model {
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
    region: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'region',
        key: 'id'
      }
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
    },
    event: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'region_setting',
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
        name: "region_tag",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "region" },
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
        name: "region",
        using: "BTREE",
        fields: [
          { name: "region" },
        ]
      },
    ]
  });
  }
}
