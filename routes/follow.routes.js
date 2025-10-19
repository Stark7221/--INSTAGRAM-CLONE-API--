const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middlewares");
const {followUser, unfollowUser, getFollowers, getFollowings,} = require("../controllers/follow.controller");

router.patch("/:id/follow", authMiddleware, followUser);
router.patch("/:id/unfollow", authMiddleware, unfollowUser);
router.get("/:id/followers", getFollowers);
router.get("/:id/followings", getFollowings);

module.exports = router;
