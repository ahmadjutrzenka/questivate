const express = require("express");
const router = express.Router();

const UserController = require("../controllers/UserController");

const authentication = require("../middlewares/authentication");

router.get("/profile", authentication, UserController.getMyProfile);
router.patch("/profile", authentication, UserController.updateMyProfile);
router.patch("/profile/avatar", authentication, UserController.updateMyAvatar);

router.get("/:username", UserController.getPublicProfile);

module.exports = router;
