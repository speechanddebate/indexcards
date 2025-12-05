import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class student extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    first: {
      type: DataTypes.STRING(63),
      allowNull: false,
      defaultValue: ""
    },
    middle: {
      type: DataTypes.STRING(63),
      allowNull: true
    },
    last: {
      type: DataTypes.STRING(63),
      allowNull: false,
      defaultValue: ""
    },
    phonetic: {
      type: DataTypes.STRING(63),
      allowNull: true
    },
    grad_year: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    novice: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    retired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    gender: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    nsda: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    chapter: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'chapter',
        key: 'id'
      }
    },
    person: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    person_request: {
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
    tableName: 'student',
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
        name: "last",
        using: "BTREE",
        fields: [
          { name: "last" },
        ]
      },
      {
        name: "first",
        using: "BTREE",
        fields: [
          { name: "first" },
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
        name: "nsda",
        using: "BTREE",
        fields: [
          { name: "nsda" },
        ]
      },
      {
        name: "chapter",
        using: "BTREE",
        fields: [
          { name: "chapter" },
        ]
      },
    ]
  });
  }
}
