import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class sweepEvent extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sweep_set: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'sweep_set',
        key: 'id'
      }
    },
    event: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    event_type: {
      type: DataTypes.ENUM('all','congress','debate','speech','wsdc','wudc'),
      allowNull: true
    },
    event_level: {
      type: DataTypes.ENUM('all','open','jv','novice','champ','es-open','es-novice','middle'),
      allowNull: true
    },
    nsda_event_category: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    sweep_award_event: {
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
    tableName: 'sweep_event',
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
        name: "sweep_set",
        using: "BTREE",
        fields: [
          { name: "sweep_set" },
        ]
      },
      {
        name: "event",
        using: "BTREE",
        fields: [
          { name: "event" },
        ]
      },
    ]
  });
  }
}
