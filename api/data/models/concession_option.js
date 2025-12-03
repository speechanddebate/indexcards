import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class concessionOption extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(31),
      allowNull: false
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    concession_type: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'concession_option',
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
        name: "concession_type",
        using: "BTREE",
        fields: [
          { name: "concession_type" },
        ]
      },
    ]
  });
  }
}
