import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class judgeHire extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    entries_requested: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    entries_accepted: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    rounds_requested: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    rounds_accepted: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    requestor: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    judge: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    school: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'school',
        key: 'id'
      }
    },
    region: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category: {
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
    tableName: 'judge_hire',
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
    ]
  });
  }
}
