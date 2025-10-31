const { connection } = require("./connection/connection");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const swaggerUi = require("swagger-ui-express");
//const swaggerSpec = require("./swagger");

console.log("starting app...");

connection();
const app = express();
app.use(cors());
const port = 666;

// Middleware para JSON
app.use(express.json());

// Rutas API
const user_routes = require("./routes/user");
const article_routes = require("./routes/article");
const follow_routes = require("./routes/follow");
app.use("/api", article_routes);
app.use("/api/user", user_routes);
app.use("/api/follow", follow_routes);

// Cargar el archivo JSON que generamos
const swaggerSpec = JSON.parse(fs.readFileSync("./swagger.json", "utf8"));

// Ruta de documentación
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Iniciar server
app.listen(port, () => {
  console.log("server started in port ", port);
  console.log(`Docs available at http://localhost:${port}/docs`);
});
