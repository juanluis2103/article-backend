
const validator = require("validator");
const Article = require("../models/Article")
const test = (req, res) => {
    return res.status(200).json({
        message: "Imma test action for controlling articles"
    })
}

const course = (req, res) => {
    return res.status(200).json({
        message: "Course endpoint"
    })
}

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
        const result = await Article.find({});

        if (!result || result.length === 0) {
            return res.status(404).json({
                status: "not_found",
                message: "No articles found"
            });
        }

        return res.status(200).json({
            status: "success",
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


module.exports = {
    test,
    course,
    create,
    getArticles
}