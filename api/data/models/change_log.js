import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class changeLog extends Model {
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
      type: DataTypes.TEXT,
      allowNull: true
    },
    count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    person: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    event: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    chapter: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    circuit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    entry: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    judge: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fine: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    panel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    new_panel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    old_panel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    school: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'change_log',
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
        name: "event",
        using: "BTREE",
        fields: [
          { name: "event" },
        ]
      },
      {
        name: "tournament",
        using: "BTREE",
        fields: [
          { name: "tourn" },
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
        name: "new_panel",
        using: "BTREE",
        fields: [
          { name: "new_panel" },
        ]
      },
      {
        name: "old_panel",
        using: "BTREE",
        fields: [
          { name: "old_panel" },
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
        name: "types",
        using: "BTREE",
        fields: [
          { name: "tag" },
          { name: "tourn" },
        ]
      },
      {
        name: "type",
        using: "BTREE",
        fields: [
          { name: "tag" },
        ]
      },
      {
        name: "created",
        using: "BTREE",
        fields: [
          { name: "created_at" },
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
        name: "panel",
        using: "BTREE",
        fields: [
          { name: "panel" },
        ]
      },
      {
        name: "round",
        using: "BTREE",
        fields: [
          { name: "round" },
        ]
      },
      {
        name: "idx_panel",
        using: "BTREE",
        fields: [
          { name: "panel" },
        ]
      },
    ]
  });
  }
}
