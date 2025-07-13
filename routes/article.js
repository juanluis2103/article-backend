const express = require("express");
const router = express.Router();
const ArticleController = require("../controllers/article.controller");

//Test routes
router.get("/test-route", ArticleController.test);
router.get("/course", ArticleController.course);

//useful routes
router.post("/create", ArticleController.create);
router.get("/getArticles", ArticleController.getArticles);
router.get("/article", ArticleController.getArticles);




module.exports = router;