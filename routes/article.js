const express = require("express");
const router = express.Router();
const multer = require("multer");
const ArticleController = require("../controllers/article.controller");

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, './images/articles/');
    },
    filename: (req, file, cb) => {
        cb(null, "article" + Date.now() + file.originalname)
    }
})

const uploads = multer({storage: storage})


//useful routes
router.post("/create", ArticleController.create);
router.get("/getArticles", ArticleController.getArticles);
router.get("/article/:id", ArticleController.getArticleById);
router.delete("/article/:id", ArticleController.deleteArticleById);
router.put("/article/:id", ArticleController.updateArticleById);
router.post("/upload-image/:id", [uploads.single("file")], ArticleController.uploadImage);



module.exports = router;