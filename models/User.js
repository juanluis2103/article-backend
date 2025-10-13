
const { Schema, model} = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = Schema({
    name: {type: String, required: true},
    nick: {type: String, required: true},
    email: {type: String, required: true},
    role: {type: String, default: "user"},
    password: {type: String,  required: true},
    created_at: {type: Date, default: Date.now},
    image: {type: String, default: "defaultUser.png"},
})

UserSchema.plugin(mongoosePaginate);


module.exports = model("User", UserSchema)