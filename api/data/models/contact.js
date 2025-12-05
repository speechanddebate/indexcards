import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class contact extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    school: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'school',
        key: 'id'
      }
    },
    person: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'person',
        key: 'id'
      }
    },
    official: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    onsite: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    email: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    book: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    no_book: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    nsda: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tag: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'person',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'contact',
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
      {
        name: "person",
        using: "BTREE",
        fields: [
          { name: "person" },
        ]
      },
      {
        name: "fk_contact_creator",
        using: "BTREE",
        fields: [
          { name: "created_by" },
        ]
      },
    ]
  });
  }
}
