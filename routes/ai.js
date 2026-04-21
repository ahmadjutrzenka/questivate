const router = require("express").Router();

const aiController = require("../controllers/aiController");

router.post("/vibe-match", aiController.vibeMatch);
router.post("/title-match", aiController.titleMatch);
router.post("/taste-dna", aiController.generateTasteDNA);

module.exports = router;
