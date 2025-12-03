import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class result extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    rank: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    place: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    percentile: {
      type: DataTypes.DECIMAL(6,2),
      allowNull: true
    },
    honor: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    honor_site: {
      type: DataTypes.STRING(63),
      allowNull: true
    },
    result_set: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    entry: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    student: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    school: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    panel: {
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
    tableName: 'result',
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
        name: "student",
        using: "BTREE",
        fields: [
          { name: "student" },
        ]
      },
      {
        name: "result_set",
        using: "BTREE",
        fields: [
          { name: "result_set" },
        ]
      },
      {
        name: "round",
        using: "BTREE",
        fields: [
          { name: "round" },
        ]
      },
    ]
  });
  }
}
