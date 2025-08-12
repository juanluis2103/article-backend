const express = require("express");
const router = express.Router();
const ArticleController = require("../controllers/article.controller");



//useful routes
router.post("/create", ArticleController.create);
router.get("/getArticles", ArticleController.getArticles);
router.get("/article/:id", ArticleController.getArticleById);
router.delete("/article/:id", ArticleController.deleteArticleById);
router.put("/article/:id", ArticleController.updateArticleById);



module.exports = router;