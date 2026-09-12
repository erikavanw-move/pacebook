import express from "express";
import { env } from "./config/env.config.js";
import ServiceManager from "./managers/ServiceManager.js";

const app = express();
const serviceManager = new ServiceManager();

// Middleware para analizar JSON del body automáticamente
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
  console.log(`Petición recibida: ${req.method} de la ruta ${req.url}`);
  next();
});

// Ruta
app.get("/", (req, res) => {
  res.send("Hola Mundo");
});

// GET
app.get("/api/services", (req, res) => {
  res.json(serviceManager.getServices());
});

// GET id
app.get("/api/services/:id", (req, res) => {
  const resultado = serviceManager.getServiceById(req.params.id);
  const status = resultado.error ? 404 : 200;
  res.status(status).json(resultado);
});

// POST
app.post("/api/services", (req, res) => {
  const resultado = serviceManager.addService(req.body);
  const status = resultado.error ? 400 : 201;
  res.status(status).json(resultado);
});

// PUT
app.put("/api/services/:id", (req, res) => {
  const resultado = serviceManager.updateService(req.params.id, req.body);
  const status = resultado.error ? 404 : 200;
  res.status(status).json(resultado);
});

// DELETE
app.delete("/api/services/:id", (req, res) => {
  const resultado = serviceManager.deleteService(req.params.id);
  const status = resultado.error ? 404 : 200;
  res.status(status).json(resultado);
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.listen(env.port, () => {
  console.log(`Servidor escuchando en el puerto ${env.port}`);
});