import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class circuit extends Model {
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
      allowNull: true
    },
    abbr: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    tz: {
      type: DataTypes.STRING(63),
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
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
    webname: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'circuit',
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
