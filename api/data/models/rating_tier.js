import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class ratingTier extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('coach','mpj'),
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    strike: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    conflict: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    min: {
      type: DataTypes.DECIMAL(8,2),
      allowNull: true
    },
    max: {
      type: DataTypes.DECIMAL(8,2),
      allowNull: true
    },
    start: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'category',
        key: 'id'
      }
    },
    rating_subset: {
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
    tableName: 'rating_tier',
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
        name: "fk_rating_tier_category",
        using: "BTREE",
        fields: [
          { name: "category" },
        ]
      },
    ]
  });
  }
}
