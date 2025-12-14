import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tourn extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(63),
      allowNull: false,
      defaultValue: ""
    },
    city: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    state: {
      type: DataTypes.CHAR(4),
      allowNull: true
    },
    country: {
      type: DataTypes.CHAR(4),
      allowNull: true
    },
    tz: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    webname: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reg_start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reg_end: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'tourn',
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
        name: "start",
        using: "BTREE",
        fields: [
          { name: "start" },
        ]
      },
      {
        name: "end",
        using: "BTREE",
        fields: [
          { name: "end" },
        ]
      },
    ]
  });
  }
}
