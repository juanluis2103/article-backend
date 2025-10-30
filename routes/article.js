// routes/article.routes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ArticleController = require("../controllers/article.controller");
const auth = require("../middlewares/auth")

// File destiny
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "images", "articles"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // .jpg | .png
    cb(null, `article_${Date.now()}${ext}`);
  },
});

// Only png or jpg
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPG and PNG files are allowed"));
};

const uploads = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB opcional
});

// Routes
router.post("/create",auth.auth, ArticleController.create);
router.get("/getArticles", ArticleController.getArticles);
router.get("/article/:id", ArticleController.getArticleById);
router.delete("/article/:id", ArticleController.deleteArticleById);
router.put("/article/:id", ArticleController.updateArticleById);
// Nuevos métodos
router.get("/articlesFromUser/:userId", ArticleController.getArticlesByUser);
router.get("/feed", auth.auth, ArticleController.getFeedArticles);

// Upload image and associate it to existent article
router.post(
  "/upload-image/:id",
  uploads.single("file0"),
  ArticleController.uploadImage
);

module.exports = router;