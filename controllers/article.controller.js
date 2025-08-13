
const validator = require("validator");
const Article = require("../models/Article")

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

  // Requiere que al menos uno sea válido (title o content)
  if (!titleOk && !contentOk) {
    throw new Error("Invalid fields, please send title or content");
  }
};
        

const create = async (req, res) => {
    let params = req.body;

    try {
        let validator_title = !validator.isEmpty(params.title) &&
                              !validator.isLength(params.title, { min: 5, max: 15 });
        let validator_content = !validator.isEmpty(params.content);

        if (!validator_title || !validator_content) {
            throw new Error("Invalid fields");
        }

        const article = new Article(params);
        const savedArticle = await article.save();

        return res.status(200).json({
            status: "success",
            message: "Article saved successfully",
            article: savedArticle
        });

    } catch (e) {
        return res.status(400).json({
            status: "error",
            message: "Error saving article",
            error: e.message
        });
    }
}

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



module.exports = {
    create,
    getArticles,
    getArticleById,
    deleteArticleById,
    updateArticleById
}