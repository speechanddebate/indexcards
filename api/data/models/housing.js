import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class housing extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(7),
      allowNull: true
    },
    night: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    waitlist: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    tba: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    requested: {
      type: DataTypes.DATE,
      allowNull: true
    },
    requestor: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    student: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    judge: {
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
    }
  }, {
    sequelize,
    tableName: 'housing',
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
    ]
  });
  }
}
