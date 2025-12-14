import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class shift extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('signup','strike','both'),
      allowNull: true
    },
    fine: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    no_hires: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'category',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'shift',
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
        name: "fk_shift_category",
        using: "BTREE",
        fields: [
          { name: "category" },
        ]
      },
    ]
  });
  }
}
