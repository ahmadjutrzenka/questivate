const { Review, User, Collection } = require("../models");
const { getDetailJikan, getDetailIGDB } = require("../helpers/externalApis");

class SearchController {
  static async getMediaDetails(req, res, next) {
    try {
      const { type, externalId } = req.params;

      if (!["anime", "manga", "game"].includes(type)) {
        throw {
          name: "BadRequest",
          message: "Type must be anime, manga, or game",
        };
      }

      let mediaInfo = null;
      if (type === "anime" || type === "manga") {
        mediaInfo = await getDetailJikan(type, externalId);
      } else {
        mediaInfo = await getDetailIGDB(externalId);
      }

      if (!mediaInfo) {
        throw {
          name: "NotFound",
          message: `${type} not found`,
        };
      }

      const collections = await Collection.findAll({
        where: {
          externalId: String(externalId),
          mediaType: type,
        },
        attributes: ["id"],
      });

      const collectionIds = collections.map((col) => col.id);

      let reviews = [];
      if (collectionIds.length > 0) {
        reviews = await Review.findAll({
          where: {
            CollectionId: collectionIds,
          },
          include: [
            {
              model: User,
              attributes: ["id", "username", "avatar"],
            },
          ],
          order: [["updatedAt", "DESC"]],
        });
        reviews = reviews.map((review) => {
          const data = review.toJSON();
          data.isEdited =
            new Date(data.updatedAt).getTime() >
            new Date(data.createdAt).getTime() + 60000;
          return data;
        });
      }

      res.status(200).json({ mediaInfo, reviews });
    } catch (error) {
      next(error);
    }
  }

  static async unifiedSearch(req, res, next) {
    res.status(501).json({ message: "Unified search is not implemented yet" });
  }

  static async getDetail(req, res, next) {
    res.status(501).json({ message: "Get detail is not implemented yet" });
  }
}

module.exports = SearchController;
