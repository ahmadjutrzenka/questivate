const express = require("express");
const router = express.Router();

const SearchController = require("../controllers/SearchController");

// Public routes
router.get("/", SearchController.unifiedSearch);

// ?q=...&type=anime|manga|game|all
router.get("/media/:type/:externalId", SearchController.getMediaDetails); // type = anime|manga|game

module.exports = router;
