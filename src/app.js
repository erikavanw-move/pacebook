import { env } from "./config/env.config.js";
import ServiceManager from "./managers/ServiceManager.js";

console.log(`🚀 Iniciando app en modo "${env.nodeEnv}" (puerto ${env.port})\n`);

const serviceManager = new ServiceManager();

console.log("📋 Servicios actuales:");
console.log(serviceManager.getServices());

console.log("\n🔍 Buscando servicio con id 1:");
console.log(serviceManager.getServiceById(1));

console.log("\n➕ Agregando un nuevo servicio:");
console.log(
  serviceManager.addService({
    name: "Yoga",
    description: "Clases de yoga para mejorar flexibilidad y concentración.",
    duration: 60,
    price: 4000,
    category: "movilidad",
    available: true,
  })
);

console.log("\n✏️  Actualizando el servicio con id 1:");
console.log(serviceManager.updateService(1, { price: 5500 }));

console.log("\n🗑️  Eliminando el servicio con id 5:");
console.log(serviceManager.deleteService(5));
