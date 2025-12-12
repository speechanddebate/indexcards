import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class diocese extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(63),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    state: {
      type: DataTypes.CHAR(4),
      allowNull: true
    },
    quota: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    archdiocese: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    cooke_award_points: {
      type: DataTypes.SMALLINT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'diocese',
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
        name: "codes",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "active" },
          { name: "code" },
        ]
      },
    ]
  });
  }
}
