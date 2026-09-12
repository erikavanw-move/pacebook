import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, "..", "data", "services.json");

const REQUIRED_FIELDS = [
  "name",
  "description",
  "duration",
  "price",
  "category",
  "available",
];

class ServiceManager {
  constructor() {
    this.services = this.#loadServices();
  }

  // ---- Persistencia interna ----

  #loadServices() {
    const raw = fs.readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  }

  #saveServices() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(this.services, null, 2));
  }

  #generateId() {
    return this.services.length > 0
      ? Math.max(...this.services.map((s) => s.id)) + 1
      : 1;
  }

  // ---- API pública ----

  getServices() {
    return this.services;
  }

  getServiceById(id) {
    const service = this.services.find((s) => s.id === Number(id));
    return service || { error: `No existe un servicio con id ${id}` };
  }

  addService(serviceData) {
    const missing = REQUIRED_FIELDS.filter(
      (field) => serviceData[field] === undefined
    );

    if (missing.length > 0) {
      return { error: `Faltan campos requeridos: ${missing.join(", ")}` };
    }

    const newService = {
      id: this.#generateId(),
      name: serviceData.name,
      description: serviceData.description,
      duration: serviceData.duration,
      price: serviceData.price,
      category: serviceData.category,
      available: serviceData.available,
    };

    this.services.push(newService);
    this.#saveServices();
    return newService;
  }

  updateService(id, updatedData) {
    const index = this.services.findIndex((s) => s.id === Number(id));

    if (index === -1) {
      return { error: `No existe un servicio con id ${id}` };
    }

    // Se descarta cualquier intento de modificar el id
    const { id: _ignoredId, ...safeData } = updatedData;

    this.services[index] = { ...this.services[index], ...safeData };
    this.#saveServices();
    return this.services[index];
  }

  deleteService(id) {
    const index = this.services.findIndex((s) => s.id === Number(id));

    if (index === -1) {
      return { error: `No existe un servicio con id ${id}` };
    }

    const [deleted] = this.services.splice(index, 1);
    this.#saveServices();
    return deleted;
  }
}

export default ServiceManager;
