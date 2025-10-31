
const validator = require("validator");
const Article = require("../models/Article")
const Follow = require("../models/Follow")
const path = require("path");
const fs = require("fs");

const validateArticle = (params = {}) => {
  const t = typeof params.title === "string" ? params.title.trim() : undefined;
  const c = typeof params.content === "string" ? params.content.trim() : undefined;

  const titleOk =
    t !== undefined &&
    !validator.isEmpty(t) &&
    validator.isLength(t, { min: 5, max: 30 });

  const contentOk =
    c !== undefined &&
    !validator.isEmpty(c);

  if (!titleOk && !contentOk) {
    throw new Error("Invalid fields, please send title or content");
  }
};
        

const create = async (req, res) => {
  try {
    const params = req.body;

    const validTitle =
      typeof params.title === "string" &&
      !validator.isEmpty(params.title.trim()) &&
      validator.isLength(params.title.trim(), { min: 5, max: 30 });

    const validContent =
      typeof params.content === "string" &&
      !validator.isEmpty(params.content.trim());

    if (!validTitle || !validContent) {
      throw new Error("Invalid fields: title and content are required");
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: missing user in token",
      });
    }

    const article = new Article({
      user: userId,
      title: params.title.trim(),
      content: params.content.trim(),
    });

    const savedArticle = await article.save();

    return res.status(201).json({
      status: "success",
      message: "Article created successfully",
      article: savedArticle,
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: "Error creating article",
      error: error.message,
    });
  }
};

const getArticles = async (req, res) => {
    try {
        const topParam = req.query.top;
        let query = Article.find({}).sort({ date: -1 });

        if (topParam) {
            const limit = parseInt(topParam, 10);
            if (!isNaN(limit) && limit > 0) {
                query = query.limit(limit);
            }
        }

        const result = await query;

        if (!result || result.length === 0) {
            return res.status(404).json({
                status: "not_found",
                message: "No articles found"
            });
        }

        return res.status(200).json({
            status: "success",
            items: result.length,
            message: "Articles retrieved successfully",
            articles: result
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error retrieving articles",
            error: error.message
        });
    }
};

const getArticleById = async (req, res) => {
    try {
        const articleId = req.params.id;
        
        if (!articleId) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or missing article ID"
            });
        }

        const article = await Article.findById(articleId);

        if (!article) {
            return res.status(404).json({
                status: "not_found",
                message: "Article not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Article retrieved successfully",
            article: article
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error retrieving article",
            error: error.message
        });
    }
};

const deleteArticleById = async (req, res) => {
    try {
        const articleId = req.params.id;
        if (!articleId) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or missing article ID"
            });
        }

        const deletedArticle = await Article.findByIdAndDelete(articleId);

        if (!deletedArticle) {
            return res.status(404).json({
                status: "not_found",
                message: "Article not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Article deleted successfully",
            article: deletedArticle
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error deleting article",
            error: error.message
        });
    }
};

const updateArticleById = async (req, res) => {
    try {
        const articleId = req.params.id;
        const updateData = req.body;
        validateArticle(req.body);

        if (!articleId) {
            return res.status(400).json({
                status: "error",
                message: "Invalid or missing article ID"
            });
        }
        const updatedArticle = await Article.findByIdAndUpdate(articleId, updateData, { new: true, runValidators: true });

        if (!updatedArticle) {
            return res.status(404).json({
                status: "not_found",
                message: "Article not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Article updated successfully",
            article: updatedArticle
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error updating article",
            error: error.message
        });
    }
};

const uploadImage = async (req, res) => {
  const articleId = req.params.id;

  try {
    if (!articleId) {
      if (req.file?.path) try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({
        status: "error",
        message: "Invalid or missing article ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded. Field name must be 'file0'.",
      });
    }

    const mimetype = req.file.mimetype?.toLowerCase() || "";
    const ext = path.extname(req.file.originalname).toLowerCase(); // .jpg /  .png
    const allowedMime = ["image/jpeg", "image/jpg", "image/png"];
    const allowedExt = [".jpg", ".jpeg", ".png"];

    if (!allowedMime.includes(mimetype)) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({
        status: "error",
        message: "Only JPG and PNG files are allowed (invalid MIME type).",
      });
    }

    if (!allowedExt.includes(ext)) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(400).json({
        status: "error",
        message: "Only JPG and PNG files are allowed (invalid extension).",
      });
    }

    const fileName = req.file.filename;
    const updated = await Article.findByIdAndUpdate(
      articleId,
      { image: fileName },
      { new: true }
    );

    if (!updated) {
      try { fs.unlinkSync(req.file.path); } catch {}
      return res.status(404).json({
        status: "not_found",
        message: "Article not found",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Image uploaded and linked to article",
      image: fileName,
      article: updated,
    });
  } catch (error) {
    if (req.file?.path) {
      try { fs.unlinkSync(req.file.path); } catch {}
    }
    return res.status(500).json({
      status: "error",
      message: "Error uploading image",
      error: error.message,
    });
  }
};

const getArticlesByUser = async (req, res) => {
 try {
    const userId = req.params.userId;

    const articles = await Article.find({ user: userId })
      .sort({ date: -1 })
      .populate("user", "name nick image");

    if (!articles || articles.length === 0) {
      return res.status(404).json({
        status: "not_found",
        message: "No articles found for this user",
      });
    }

    return res.status(200).json({
      status: "success",
      count: articles.length,
      articles,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error retrieving user's articles",
      error: error.message,
    });
  }
};

const getFeedArticles = async (req, res) => {
 try {
    const userId = req.user.id;

    const follows = await Follow.find({ user: userId }).select("followed");

    if (!follows || follows.length === 0) {
      return res.status(404).json({
        status: "not_found",
        message: "No sigues a ningún usuario todavía.",
      });
    }

    const followedIds = follows.map(f => f.followed);

    const articles = await Article.find({ user: { $in: followedIds } })
      .sort({ date: -1 })
      .populate("user", "name nick image");

    if (!articles || articles.length === 0) {
      return res.status(404).json({
        status: "not_found",
        message: "No hay artículos de los usuarios que sigues.",
      });
    }

    return res.status(200).json({
      status: "success",
      count: articles.length,
      articles,
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al obtener los artículos del feed.",
      error: error.message,
    });
  }
};


module.exports = {
    create,
    getArticles,
    getArticleById,
    deleteArticleById,
    updateArticleById,
    uploadImage,
    getFeedArticles,
    getArticlesByUser
}