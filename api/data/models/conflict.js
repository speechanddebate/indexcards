import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class conflict extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(15),
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
    conflicted: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'person',
        key: 'id'
      }
    },
    chapter: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'chapter',
        key: 'id'
      }
    },
    added_by: {
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
    tableName: 'conflict',
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
        name: "uk_constraint",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "person" },
          { name: "conflicted" },
          { name: "chapter" },
        ]
      },
      {
        name: "chapter",
        using: "BTREE",
        fields: [
          { name: "chapter" },
        ]
      },
      {
        name: "conflict",
        using: "BTREE",
        fields: [
          { name: "conflicted" },
        ]
      },
      {
        name: "added_by",
        using: "BTREE",
        fields: [
          { name: "added_by" },
        ]
      },
      {
        name: "person",
        using: "BTREE",
        fields: [
          { name: "person" },
        ]
      },
    ]
  });
  }
}
