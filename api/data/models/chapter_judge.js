import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class chapterJudge extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    first: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    middle: {
      type: DataTypes.STRING(63),
      allowNull: true
    },
    last: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    ada: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    retired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    phone: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    diet: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    notes_timestamp: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'chapter_judge',
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
        name: "chapter",
        using: "BTREE",
        fields: [
          { name: "chapter" },
        ]
      },
      {
        name: "person",
        using: "BTREE",
        fields: [
          { name: "person" },
        ]
      },
    ]
  });
  }
}
