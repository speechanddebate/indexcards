import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class rating extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('school','entry','coach'),
      allowNull: true
    },
    draft: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    entered: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ordinal: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0
    },
    percentile: {
      type: DataTypes.DECIMAL(8,2),
      allowNull: true
    },
    tourn: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    school: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    entry: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rating_tier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    judge: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rating_subset: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    side: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    sheet: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'rating',
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
        name: "uk_entry_rating",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "judge" },
          { name: "entry" },
          { name: "sheet" },
        ]
      },
      {
        name: "uk_school_rating",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "judge" },
          { name: "school" },
          { name: "sheet" },
        ]
      },
      {
        name: "entry",
        using: "BTREE",
        fields: [
          { name: "entry" },
        ]
      },
      {
        name: "judge",
        using: "BTREE",
        fields: [
          { name: "judge" },
        ]
      },
      {
        name: "tourn",
        using: "BTREE",
        fields: [
          { name: "tourn" },
        ]
      },
    ]
  });
  }
}
