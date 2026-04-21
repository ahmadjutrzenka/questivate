"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TasteDNA extends Model {
    static associate(models) {
      TasteDNA.belongsTo(User, {
        foreignKey: "userId",
      });
    }
  }
  TasteDNA.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      generatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "TasteDNA",
    },
  );
  return TasteDNA;
};
