//importar dependencias
const { getUnixTime,addDays } = require("date-fns")
const jwt = require("jwt-simple")
const { create } = require("../controllers/article.controller")


const secret = "SECRET_KEY_FOR_MY_PROJECT_66611"
//clave secreta (para crear el token)

//funcion de devolver tokens fun anonima
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: getUnixTime(new Date()),
        exp: getUnixTime(addDays(new Date(), 30)), // 30 días después
    }
      return jwt.encode(payload, secret);

}

//devolver jwt codificado
module.exports = {
    createToken
};


