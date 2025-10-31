const mongoose = require("mongoose");


const connection = async() => {
    try {
    const password = encodeURIComponent("CachotoroLeon123@.");
    const uri = `mongodb+srv://juanchito:${password}@mycluster.9i6f5wb.mongodb.net/articles?retryWrites=true&w=majority&appName=mycluster`;
		await mongoose.connect(uri)
		console.log("Correctly connected to pruebadb database")
    } catch(err) {
        console.log(err);
    	throw new Error("Not possible to connect to databes")
    }
}

module.exports = {
	connection
}