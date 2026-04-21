const express = require("express");
const router = express.Router();

const CollectionController = require("../controllers/CollectionController");

const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");

router.use(authentication);
router.get("/", CollectionController.getMyCollections);
router.post("/", CollectionController.addCollection);
router.patch("/:id", authorization, CollectionController.updateCollection);
router.delete("/:id", authorization, CollectionController.deleteCollection);

module.exports = router;
