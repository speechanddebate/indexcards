import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class strike extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    registrant: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    conflict: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    conflictee: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    judge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    event: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    entry: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    school: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    region: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    district: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    timeslot: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    shift: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    entered_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dioregion: {
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
    tableName: 'strike',
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
        name: "judge",
        using: "BTREE",
        fields: [
          { name: "judge" },
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
        name: "tourn",
        using: "BTREE",
        fields: [
          { name: "tourn" },
        ]
      },
    ]
  });
  }
}
