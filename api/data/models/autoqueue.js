import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class autoqueue extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tag: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    event: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    active_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'autoqueue',
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
