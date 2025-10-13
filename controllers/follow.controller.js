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
            return res.status(400).send({ message: "No puedes seguirte a ti mismo." });
        }

        // Verificar si ya lo sigue
        const existe = await Follow.findOne({ user: userId, followed: followedId });
        if (existe) {
            return res.status(400).send({ message: "Ya sigues a este usuario." });
        }

        const follow = new Follow({
            user: userId,
            followed: followedId
        });

        const followStored = await follow.save();

        return res.status(200).send({
            message: "Has empezado a seguir al usuario.",
            follow: followStored
        });

    } catch (error) {
        return res.status(500).send({
            message: "Error al intentar seguir al usuario.",
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
            return res.status(404).send({ message: "No estabas siguiendo a este usuario." });
        }

        return res.status(200).send({
            message: "Has dejado de seguir al usuario."
        });

    } catch (error) {
        return res.status(500).send({
            message: "Error al intentar dejar de seguir.",
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
            message: "Error al listar seguidores.",
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