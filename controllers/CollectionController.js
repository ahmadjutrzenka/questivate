const { Collection } = require("../models");

class CollectionController {
  static async getMyCollections(req, res, next) {
    try {
      const { type } = req.query;
      const where = { userId: req.user.id };

      if (type) {
        if (!["anime", "manga", "game"].includes(type)) {
          throw {
            name: "BadRequest",
            message: "Type must be anime, manga, or game",
          };
        }
        where.mediaType = type;
      }

      const collections = await Collection.findAll({
        where,
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({ collections });
    } catch (error) {
      next(error);
    }
  }

  static async addCollection(req, res, next) {
    try {
      const {
        mediaType,
        externalId,
        title,
        coverUrl,
        genres,
        synopsis,
        score,
        status,
      } = req.body;

      const collection = await Collection.create({
        userId: req.user.id,
        mediaType,
        externalId,
        title,
        coverUrl,
        genres,
        synopsis,
        score,
        status,
      });

      res.status(201).json({ collection });
    } catch (error) {
      next(error);
    }
  }
  static async getCollectionById(req, res, next) {
    try {
      const { id } = req.params;
      const collection = await Collection.findByPk(id);

      if (!collection) {
        throw {
          name: "NotFound",
          message: "Collection not found",
        };
      }

      res.status(200).json({ collection });
    } catch (error) {
      next(error);
    }
  }
  static async updateCollection(req, res, next) {
    try {
      const { id } = req.params;
      const { status, isFavorite } = req.body;

      const collection = await Collection.findByPk(id);

      if (!collection) {
        throw {
          name: "NotFound",
          message: "Collection not found",
        };
      }

      if (isFavorite === true && !collection.isFavorite) {
        const favoriteCount = await Collection.count({
          where: {
            userId: req.user.id,
            isFavorite: true,
          },
        });
        if (favoriteCount >= 5) {
          throw {
            name: "BadRequest",
            message: "You can only have up to 5 favorite items",
          };
        }
      }
      await collection.update({ status, isFavorite });

      res.status(200).json({ collection });
    } catch (error) {
      next(error);
    }
  }
  static async deleteCollection(req, res, next) {
    try {
      const { id } = req.params;
      const collection = await Collection.findByPk(id);

      if (!collection) {
        throw {
          name: "NotFound",
          message: "Collection not found",
        };
      }

      await collection.destroy();
      res.status(200).json({ message: `Collection ${id} has been deleted` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CollectionController;
