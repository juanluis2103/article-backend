const {connection} = require("./connection/connection");
const express = require("express");
const cors = require("cors")

console.log("starting app...")

connection();
const app = express();
app.use(cors());
const port = 666;

//change body to .js object
app.use(express.json());

//ROUTES
const article_routes = require("./routes/article");
app.use("/api", article_routes)

app.listen(port, () => {
    console.log("server started in port ", port)
})