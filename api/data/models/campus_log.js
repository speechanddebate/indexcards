import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class campusLog extends Model {
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
    uuid: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: ""
    },
    marker: {
      type: DataTypes.INTEGER,
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
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'tourn',
        key: 'id'
      }
    },
    panel: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'panel',
        key: 'id'
      }
    },
    school: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'school',
        key: 'id'
      }
    },
    judge: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'judge',
        key: 'id'
      }
    },
    entry: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'entry',
        key: 'id'
      }
    },
    student: {
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
    tableName: 'campus_log',
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
        name: "panel",
        using: "BTREE",
        fields: [
          { name: "panel" },
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
        name: "school",
        using: "BTREE",
        fields: [
          { name: "school" },
        ]
      },
      {
        name: "entry",
        using: "BTREE",
        fields: [
          { name: "entry" },
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
