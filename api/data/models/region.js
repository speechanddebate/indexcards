import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class region extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(31),
      allowNull: true
    },
    quota: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    arch: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    cooke_pts: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sweeps: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    circuit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'region',
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
    ]
  });
  }
}
