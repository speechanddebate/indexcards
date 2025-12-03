import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class tournCircuit extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    approved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    circuit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'tourn_circuit',
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
        name: "uk_tourn_circuit",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "tourn" },
          { name: "circuit" },
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
    ]
  });
  }
}
