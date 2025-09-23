
const { Schema, model} = require("mongoose");

const UserSchema = Schema({
    name: {type: String, required: true},
    nick: {type: String, required: true},
    email: {type: String, required: true},
    role: {type: String, default: "user"},
    password: {type: String,  required: true},
    created_at: {type: Date, default: Date.now},
    image: {type: String, default: "defaultUser.png"},
})

module.exports = model("User", UserSchema)