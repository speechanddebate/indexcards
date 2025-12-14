import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class chapterCircuit extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    full_member: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    circuit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'circuit',
        key: 'id'
      }
    },
    chapter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      references: {
        model: 'chapter',
        key: 'id'
      }
    },
    region: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    circuit_membership: {
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
    tableName: 'chapter_circuit',
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
        name: "uk_chapter_circuit",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "chapter" },
          { name: "circuit" },
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
        name: "circuit",
        using: "BTREE",
        fields: [
          { name: "circuit" },
        ]
      },
    ]
  });
  }
}
