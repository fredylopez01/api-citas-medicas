require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { PrismaClient } = require("./generated/prisma");
const prisma = new PrismaClient();

const loggerMiddleware = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const { validateUser } = require("./utils/validation");

const fs = require("fs");
const path = require("path");
const usersFilePath = path.join(__dirname, "users.json");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(loggerMiddleware);
app.use(errorHandler);

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
    return res.status(400).json({ message: "No se recibieron datos" });
  }
  res.status(201).json({
    message: "Información recibida",
    data,
  });
});

app.get("/users", (req, res) => {
  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) {
      return res
        .status(404)
        .json({ message: "Error no se pudo recuperar los datos" });
    }
    const users = JSON.parse(data);
    res.status(200).json(users);
  });
});

app.post("/users", (req, res) => {
  const newUser = req.body;
  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error con conexión de datos" });
    }
    const users = JSON.parse(data);

    const validation = validateUser(newUser, users);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    users.push(newUser);
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error con conexión de datos" });
      } else {
        res.status(201).json(newUser);
      }
    });
  });
});

app.put("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const updatedUser = req.body;

  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error con conexión de datos" });
    }
    let users = JSON.parse(data);

    const validation = validateUser(updatedUser, users, userId);
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.error });
    }

    users = users.map((user) =>
      user.id === userId ? { ...user, ...updatedUser } : user
    );
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error con conexión de datos" });
      } else {
        res.json({ updatedUser });
      }
    });
  });
});

app.delete("/users/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error con conexión de datos" });
    }
    let users = JSON.parse(data);
    users = users.filter((user) => user.id !== userId);
    fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error con conexión de datos" });
      } else {
        res.status(204).send();
      }
    });
  });
});

app.get("/error", (req, res, next) => {
  next(new Error("Error intencional"));
});

app.get("/db-users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al comunicarse con la base de datos" });
  }
});

app.listen(PORT, () => {
  console.log(`API running: http://localhost:${PORT}`);
});
