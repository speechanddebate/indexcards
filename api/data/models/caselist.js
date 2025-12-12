import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class caselist extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    eventcode: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    person: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'person',
        key: 'id'
      }
    },
    partner: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'person',
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
    tableName: 'caselist',
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
        name: "slug",
        using: "BTREE",
        fields: [
          { name: "slug" },
        ]
      },
      {
        name: "fk_clist_person",
        using: "BTREE",
        fields: [
          { name: "person" },
        ]
      },
      {
        name: "fk_clist_partner",
        using: "BTREE",
        fields: [
          { name: "partner" },
        ]
      },
    ]
  });
  }
}
