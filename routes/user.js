// routes/user.routes.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
const auth = require("../middlewares/auth")

// CRUD
router.post("/register", UserController.createUser);
router.get("/users", UserController.listUsers);
router.get("/getById/:id", auth.auth , UserController.getUserById);
router.put("/user/:id", UserController.updateUserById);
router.delete("/user/:id", UserController.deleteUserById);
router.post("/login", UserController.loginUser);

module.exports = router;
