import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class session extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    userkey: {
      type: DataTypes.STRING(127),
      allowNull: true
    },
    ip: {
      type: DataTypes.STRING(63),
      allowNull: true
    },
    defaults: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    su: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    person: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'person',
        key: 'id'
      }
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    event: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    weekend: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    agent_data: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    geoip: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    push_notify: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'session',
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
        name: "userkey",
        using: "BTREE",
        fields: [
          { name: "userkey" },
        ]
      },
      {
        name: "fk_session_person",
        using: "BTREE",
        fields: [
          { name: "person" },
        ]
      },
    ]
  });
  }
}
