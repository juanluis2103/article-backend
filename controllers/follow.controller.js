const User = require("../models/User")
const Follow = require("../models/Follow")

const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "mensaje enviado desde: controllers/follow"
    })
}

const saveFollow = async (req, res) => {
    try {
        const userId = req.user.id; //authed user
        const followedId = req.body.followed;

        if (userId === followedId) {
            return res.status(400).send({ message: "Cant follow yourself" });
        }

        // Verificar si ya lo sigue
        const existe = await Follow.findOne({ user: userId, followed: followedId });
        if (existe) {
            return res.status(400).send({ message: "Already following this user" });
        }

        const follow = new Follow({
            user: userId,
            followed: followedId
        });

        const followStored = await follow.save();

        return res.status(200).send({
            message: "You are now following.",
            follow: followStored
        });

    } catch (error) {
        return res.status(500).send({
            message: "Fail to follow the user.",
            error: error.message
        });
    }
};

const unfollow = async (req, res) => {
    try {
        const userId = req.user.id; // usuario logueado
        const followedId = req.params.id; // id del usuario que se dejará de seguir

        const deleted = await Follow.findOneAndDelete({
            user: userId,
            followed: followedId
        });

        if (!deleted) {
            return res.status(404).send({ message: "You were not following this user" });
        }

        return res.status(200).send({
            message: "Unfollowed user!."
        });

    } catch (error) {
        return res.status(500).send({
            message: "ERROR trying to follow the user.",
            error: error.message
        });
    }
};

const followersList = async (req, res) => {
    try {
        const userId = req.params.id || req.user.id; // puede ser el propio usuario o uno específico

        // Buscar todos los follows donde "followed" sea yo
        const followers = await Follow.find({ followed: userId })
            .populate('user', '-password -__v') // muestra datos del seguidor, excluyendo contraseña
            .exec();

        return res.status(200).send({
            total: followers.length,
            followers
        });

    } catch (error) {
        return res.status(500).send({
            message: "Error listing users",
            error: error.message
        });
    }
};



//accion de follow (guardar follow)
//accion de borrar un follow (dejar de seguir)
//accion de listar usuarios que me siguen
module.exports = {
    pruebaFollow,
    saveFollow,
    unfollow,
    followersList
};