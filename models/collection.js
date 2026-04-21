"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Collection extends Model {
    static associate(models) {
      Collection.belongsTo(User, {
        foreignKey: "userId",
      });
      Collection.hasOne(Review, {
        foreignKey: "collectionId",
      });
    }
  }
  Collection.init(
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
      mediaType: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["anime", "manga", "game"],
      },
      externalId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      coverUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      genres: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      synopsis: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      score: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM,
        values: ["plan", "ongoing", "completed", "dropped"],
        allowNull: false,
      },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Collection",
    },
  );
  return Collection;
};
