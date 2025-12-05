import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class permission extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tag: {
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
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tourn',
        key: 'id'
      }
    },
    region: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'region',
        key: 'id'
      }
    },
    district: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'district',
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
    circuit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'circuit',
        key: 'id'
      }
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'category',
        key: 'id'
      }
    },
    event: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'permission',
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
      {
        name: "region",
        using: "BTREE",
        fields: [
          { name: "region" },
        ]
      },
      {
        name: "tourn",
        using: "BTREE",
        fields: [
          { name: "tourn" },
        ]
      },
      {
        name: "circuit",
        using: "BTREE",
        fields: [
          { name: "circuit" },
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
        name: "category",
        using: "BTREE",
        fields: [
          { name: "category" },
        ]
      },
      {
        name: "district",
        using: "BTREE",
        fields: [
          { name: "district" },
        ]
      },
      {
        name: "event",
        using: "BTREE",
        fields: [
          { name: "event" },
        ]
      },
    ]
  });
  }
}
