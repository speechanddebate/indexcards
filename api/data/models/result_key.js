import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class resultKey extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tag: {
      type: DataTypes.STRING(63),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    no_sort: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    sort_desc: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    result_set: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'result_set',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'result_key',
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
        name: "result_set",
        using: "BTREE",
        fields: [
          { name: "result_set" },
        ]
      },
    ]
  });
  }
}
