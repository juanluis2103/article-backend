const mongoose = require("mongoose");

const connection = async() => {
    try {
		await mongoose.connect("mongodb://localhost:27017/pruebadb")
		console.log("Correctly connected to pruebadb database")
    } catch(err) {
        console.log(err);
    	throw new Error("Not possible to connect to databes")
    }
}

module.exports = {
	connection
}