require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const fs = require("fs");
const path = require("path");
const { error } = require("console");
const usersFilePath = path.join(__dirname, "users.json");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`
    <h1>Esta es mi API</h1>
    <p>Esto es una api con nodejs y expressjs</p>
    <p>Se esta ejecutando en el puerto ${PORT}</p>
    `);
});

app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.send(`Mostrar información del usuario con id: ${userId}`);
});

app.get("/search", (req, res) => {
  const terms = req.query.termino || "No especificado";
  const category = req.query.category || "Todas";
  res.send(`
    <h2>Resultado de busqueda</h2>
    <p>Termino: ${terms}</p>
    <p>Categoria: ${category}</p>
    `);
});

app.post("/form", (req, res) => {
  const name = req.body.name || "Anónimo";
  const email = req.body.email || "No proporcionado";
  res.json({
    message: "Datos recibidos",
    data: {
      name,
      email,
    },
  });
});

app.post("/api/data", (req, res) => {
  const data = req.body;

  if (!data || Object.keys(data).length == 0) {
    return res.status(400).json({ error: "No se recibieron datos" });
  }
  res.status(201).json({
    message: "Información recibida",
    data,
  });
});

app.get("/users", (req, res) => {
  fs.readFile(usersFilePath, "utf-8", (error, data) => {
    if (error) {
      return res
        .status(404)
        .json({ errorText: "Error no se pudo recuperar los datos" });
    }
    const users = JSON.parse(data);
    res.status(200).json(users);
  });
});

app.listen(PORT, () => {
  console.log(`API running: http://localhost:${PORT}`);
});
