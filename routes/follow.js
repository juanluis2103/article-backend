// routes/user.routes.js
const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follow.controller");
const auth = require("../middlewares/auth")

// CRUD
router.get("/prueba", FollowController.pruebaFollow);
router.post("/save",auth.auth , FollowController.saveFollow);
router.delete("/delete/:id",auth.auth, FollowController.unfollow);
router.get("/listAll/:id",auth.auth, FollowController.followersList);

module.exports = router;
