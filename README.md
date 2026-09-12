# Pacebook — Service Manager

Proyecto Node.js (ESM) que implementa una clase `ServiceManager` para gestionar
los servicios (clases) de un sistema de turnos y reservas.

## Instalación

npm install

## Variables de entorno

Archivo `.env`:

## Recurso: `services`

Cada servicio tiene esta forma:

{
  "id": 1,
  "name": "Running",
  "description": "Mejorá tu técnica de carrera con entrenadores especializados.",
  "duration": 60,
  "price": 5000,
  "category": "cardio",
  "available": true
}
```

| Campo         | Tipo    | Descripción                              |
| ------------- | ------- | ----------------------------------------- |
| `id`          | number  | Identificador único, generado internamente |
| `name`        | string  | Nombre del servicio                       |
| `description` | string  | Descripción del servicio                  |
| `duration`    | number  | Duración en minutos                       |
| `price`       | number  | Precio del servicio                       |
| `category`    | string  | Categoría (ej: cardio, fuerza, movilidad) |
| `available`   | boolean | Si el servicio está disponible            |


## Métodos de `ServiceManager`

### `getServices()`

const serviceManager = new ServiceManager();
serviceManager.getServices();
// [{ id: 1, name: "Running", ... }, { id: 2, name: "Funcional", ... }, ...]


### `getServiceById(id)`

Devuelve el servicio con ese `id`, o un objeto `{ error }` si no existe.

serviceManager.getServiceById(1);
// { id: 1, name: "Running", ... }

serviceManager.getServiceById(999);
// { error: "No existe un servicio con id 999" }

### `addService(serviceData)`

Agrega un servicio nuevo. El `id` se genera automáticamente y no se recibe
como parámetro. Valida que estén presentes `name`, `description`, `duration`,
`price`, `category` y `available`; si falta alguno, devuelve un error.

serviceManager.addService({
  name: "Yoga",
  description: "Clases de yoga para mejorar flexibilidad y concentración.",
  duration: 60,
  price: 4000,
  category: "movilidad",
  available: true,
});
// { id: 5, name: "Yoga", ... }

serviceManager.addService({ name: "Incompleto" });
// { error: "Faltan campos requeridos: description, duration, price, category, available" }

### `updateService(id, updatedData)`

Actualiza el servicio con ese `id`. No permite modificar el `id` (se ignora
si viene en `updatedData`). Devuelve `{ error }` si el servicio no existe.

serviceManager.updateService(1, { price: 5500 });
// { id: 1, name: "Running", price: 5500, ... }

serviceManager.updateService(999, { price: 100 });
// { error: "No existe un servicio con id 999" }

### `deleteService(id)`

Elimina el servicio con ese `id` y lo devuelve. Devuelve `{ error }` si no
existe.

serviceManager.deleteService(2);
// { id: 2, name: "Funcional", ... }

serviceManager.deleteService(999);
// { error: "No existe un servicio con id 999" }

