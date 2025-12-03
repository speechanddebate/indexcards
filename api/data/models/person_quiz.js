import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class personQuiz extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    pending: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    answers: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    person: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'person',
        key: 'id'
      }
    },
    quiz: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'quiz',
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
    tableName: 'person_quiz',
    timestamps: true,
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
        name: "fk_pq_person",
        using: "BTREE",
        fields: [
          { name: "person" },
        ]
      },
      {
        name: "fk_pq_quiz",
        using: "BTREE",
        fields: [
          { name: "quiz" },
        ]
      },
    ]
  });
  }
}
