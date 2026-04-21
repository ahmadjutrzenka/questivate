"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(User, {
        foreignKey: "userId",
      });
      Review.belongsTo(Collection, {
        foreignKey: "collectionId",
      });
    }
  }
  Review.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      collectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Collections",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      rating: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Review",
    },
  );
  return Review;
};
