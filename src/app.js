import http from "http";
import { env } from "./config/env.config.js";
import ServiceManager from "./managers/ServiceManager.js";

const serviceManager = new ServiceManager();

// ---- Helpers ----

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("JSON inválido en el body"));
      }
    });
    req.on("error", reject);
  });
}

// ---- Servidor ----

const server = http.createServer(async (req, res) => {
  console.log(`Petición recibida: ${req.method} de la ruta ${req.url}`);

  const url = new URL(req.url, `http://${req.headers.host}`);
  const partes = url.pathname.split("/").filter(Boolean); // ej: ["api", "services", "1"]

  // Ruta raíz, de prueba
  if (partes.length === 0 && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Hola Mundo");
  }

  // Todo lo demás debe empezar con /api/services
  if (partes[0] !== "api" || partes[1] !== "services") {
    return sendJSON(res, 404, { error: "Ruta no encontrada" });
  }

  const id = partes[2]; // undefined si es /api/services, o el id si es /api/services/:id

  try {
    // GET /api/services
    if (req.method === "GET" && !id) {
      return sendJSON(res, 200, serviceManager.getServices());
    }

    // GET /api/services/:id
    if (req.method === "GET" && id) {
      const resultado = serviceManager.getServiceById(id);
      const status = resultado.error ? 404 : 200;
      return sendJSON(res, status, resultado);
    }

    // POST /api/services
    if (req.method === "POST" && !id) {
      const body = await readBody(req);
      const resultado = serviceManager.addService(body);
      const status = resultado.error ? 400 : 201;
      return sendJSON(res, status, resultado);
    }

    // PUT /api/services/:id
    if (req.method === "PUT" && id) {
      const body = await readBody(req);
      const resultado = serviceManager.updateService(id, body);
      const status = resultado.error ? 404 : 200;
      return sendJSON(res, status, resultado);
    }

    // DELETE /api/services/:id
    if (req.method === "DELETE" && id) {
      const resultado = serviceManager.deleteService(id);
      const status = resultado.error ? 404 : 200;
      return sendJSON(res, status, resultado);
    }

    // Método/ruta no soportados
    return sendJSON(res, 405, { error: `Método ${req.method} no permitido en esta ruta` });
  } catch (error) {
    return sendJSON(res, 400, { error: error.message });
  }
});

server.listen(env.port, () => {
  console.log(`Servidor escuchando en el puerto ${env.port}`);
});
