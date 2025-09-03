require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

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

app.listen(PORT, () => {
  console.log(`API running: http://localhost:${PORT}`);
});
