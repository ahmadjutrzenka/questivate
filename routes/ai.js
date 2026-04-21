const express = require("express");
const router = express.Router();

const aiController = require("../controllers/aiController");

const authentication = require("../middlewares/authentication");

router.use(authentication);
router.post("/vibe-match", aiController.vibeMatch);
router.post("/title-match", aiController.titleMatch);
router.post("/taste-dna", aiController.generateTasteDNA);

module.exports = router;
