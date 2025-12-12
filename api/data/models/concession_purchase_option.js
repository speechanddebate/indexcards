import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class concessionPurchaseOption extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    concession_purchase: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'concession_purchase',
        key: 'id'
      }
    },
    concession_option: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'concession_option',
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
    tableName: 'concession_purchase_option',
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
        name: "uk_purchase_option",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "concession_purchase" },
          { name: "concession_option" },
        ]
      },
      {
        name: "concession_purchase",
        using: "BTREE",
        fields: [
          { name: "concession_purchase" },
        ]
      },
      {
        name: "concession_option",
        using: "BTREE",
        fields: [
          { name: "concession_option" },
        ]
      },
    ]
  });
  }
}
