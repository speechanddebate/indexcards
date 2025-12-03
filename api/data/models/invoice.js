import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class invoice extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    blusynergy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    blu_number: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    total: {
      type: DataTypes.DECIMAL(8,2),
      allowNull: false,
      defaultValue: 0.00
    },
    paid: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    school: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'school',
        key: 'id'
      }
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'invoice',
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
