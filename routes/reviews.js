const express = require("express");
const router = express.Router();

const ReviewController = require("../controllers/ReviewController");

const authentication = require("../middlewares/authentication");

const authorization = require("../middlewares/authorization");

// Public routes - on Dashboard

router.get("/recent", ReviewController.getRecentReviews);

// Protected routes
router.get(
  "/:collectionId",
  authentication,
  ReviewController.getReviewByCollectionId,
);
router.post("/", authentication, ReviewController.createReview);
router.put(
  "/:id",
  authentication,
  authorization,
  ReviewController.updateReview,
);
router.delete(
  "/:id",
  authentication,
  authorization,
  ReviewController.deleteReview,
);

module.exports = router;
