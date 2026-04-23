const router = require("express").Router();

const AIController = require("../controllers/aiController");

router.post("/vibe-check", AIController.vibeCheck);
router.post("/title-match", AIController.titleMatch);
router.post("/taste-dna", AIController.generateTasteDNA);

module.exports = router;
