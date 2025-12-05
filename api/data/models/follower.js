import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class follower extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(8),
      allowNull: true
    },
    person: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    follower: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    school: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'school',
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
    tableName: 'follower',
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
        name: "school",
        using: "BTREE",
        fields: [
          { name: "school" },
        ]
      },
      {
        name: "follower",
        using: "BTREE",
        fields: [
          { name: "follower" },
        ]
      },
      {
        name: "type",
        using: "BTREE",
        fields: [
          { name: "type" },
        ]
      },
    ]
  });
  }
}
