import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class sweepAwardEvent extends Model {
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
      allowNull: false
    },
    abbr: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    level: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    sweep_set: {
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
    tableName: 'sweep_award_event',
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
        name: "sweep_set",
        using: "BTREE",
        fields: [
          { name: "sweep_set" },
        ]
      },
    ]
  });
  }
}
