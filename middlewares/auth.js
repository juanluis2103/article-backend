//importar deps
const jwt = require('jwt-simple');
const { isBefore, fromUnixTime } = require('date-fns');
const libjwt = require('../env/variables');
//importar clave


//funcion de autenticacion 
const secret = libjwt.secret;
// (comprobar si me llegala cabecera de autenticacioon, 
// decodificar toke, 
// agregar datos de usuario a la request)



exports.auth = (req, res, next) => {
    // 1. Comprobar que existe la cabecera Authorization
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: 'error',
            message: 'Petition does not have auth header'
        });
    }

    // 2. Limpiar el token (quitar "Bearer " si lo tiene)
    let token = req.headers.authorization.replace('Bearer ', '').trim();

    // 3. Decodificar el token
    try {
        const payload = jwt.decode(token, secret);

        // 4. Revisar expiración del token
        // payload.exp asumimos que está en formato UNIX timestamp (segundos)
        const now = new Date();
        if (payload.exp && isBefore(fromUnixTime(payload.exp), now)) {
            return res.status(401).send({
                status: 'error',
                message: 'Token expired'
            });
        }

        // 5. Agregar datos del usuario a la request
        req.user = payload;

        // 6. Pasar al siguiente middleware
        next();

    } catch (error) {
        return res.status(401).send({
            status: 'error',
            message: 'Token inválido',
            error: error.message
        });
    }
};