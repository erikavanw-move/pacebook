// ============================================================
// PB — Gestor de Turnos
// app.js
// ============================================================

// Estado global de la app
const estado = {
  servicios: [],
  horarios: [],
  reservas: [],
  seleccion: {
    servicio: null,
    fecha: null,
    horario: null,
  },
};

// ============================================================
// INICIALIZACIÓN
// ============================================================

async function init() {
  try {
    await cargarDatos();
    renderServicios();
    setupNavegacion();
    setupFecha();
    setupConfirmar();
    renderMisTurnos();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al cargar",
      text: "No se pudieron cargar los datos. Recargá la página.",
    });
  }
}

// ============================================================
// CARGA DE DATOS (Fetch)
// ============================================================

async function cargarDatos() {
  const [serviciosRes, horariosRes] = await Promise.all([
    fetch("data/servicios.json"),
    fetch("data/horarios.json"),
  ]);

  estado.servicios = await serviciosRes.json();
  estado.horarios = await horariosRes.json();

  // Las reservas se guardan en localStorage (simulando persistencia)
  const guardadas = localStorage.getItem("pb_reservas");
  estado.reservas = guardadas ? JSON.parse(guardadas) : [];
}

// ============================================================
// NAVEGACIÓN
// ============================================================

function setupNavegacion() {
  const botones = document.querySelectorAll(".nav-btn");

  botones.forEach((btn) => {
    btn.addEventListener("click", () => {
      const seccion = btn.dataset.section;

      // Actualizar botones activos
      botones.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Mostrar sección correspondiente
      document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
      document.getElementById(`section-${seccion}`).classList.add("active");

      if (seccion === "mis-turnos") renderMisTurnos();
    });
  });
}

// ============================================================
// PASO 1 — SERVICIOS
// ============================================================

function renderServicios() {
  const grid = document.getElementById("servicios-grid");

  grid.innerHTML = estado.servicios
    .map(
      (s) => `
    <div class="servicio-card" data-id="${s.id}">
      <div class="servicio-card__bg" style="background-image: url('${s.imagen}')"></div>
      <div class="servicio-card__content">
        <div class="servicio-card__icono">${s.icono}</div>
        <div class="servicio-card__nombre">${s.nombre}</div>
        <div class="servicio-card__desc">${s.descripcion}</div>
        <div class="servicio-card__duracion">⏱ ${s.duracion} min</div>
      </div>
    </div>
  `
    )
    .join("");

  // Delegación de eventos en el grid
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".servicio-card");
    if (!card) return;

    const servicioId = parseInt(card.dataset.id);
    seleccionarServicio(servicioId);
  });
}

function seleccionarServicio(id) {
  estado.seleccion.servicio = estado.servicios.find((s) => s.id === id);
  estado.seleccion.fecha = null;
  estado.seleccion.horario = null;

  // Marcar card seleccionada
  document.querySelectorAll(".servicio-card").forEach((c) => c.classList.remove("selected"));
  document.querySelector(`.servicio-card[data-id="${id}"]`).classList.add("selected");

  // Mostrar paso de fecha
  const stepFecha = document.getElementById("step-fecha");
  stepFecha.style.display = "block";

  // Resetear pasos siguientes
  document.getElementById("step-horarios").style.display = "none";
  document.getElementById("step-datos").style.display = "none";
  document.getElementById("input-fecha").value = "";
}

// ============================================================
// PASO 2 — FECHA
// ============================================================

function setupFecha() {
  const inputFecha = document.getElementById("input-fecha");

  // Bloquear fechas pasadas
  const hoy = new Date().toISOString().split("T")[0];
  inputFecha.setAttribute("min", hoy);

  inputFecha.addEventListener("change", () => {
    const fecha = inputFecha.value;
    if (!fecha) return;

    estado.seleccion.fecha = fecha;
    estado.seleccion.horario = null;
    renderHorarios();
  });
}

// ============================================================
// PASO 3 — HORARIOS
// ============================================================

function renderHorarios() {
  const { servicio, fecha } = estado.seleccion;
  const stepHorarios = document.getElementById("step-horarios");
  const grid = document.getElementById("horarios-grid");

  // Filtrar horarios del servicio seleccionado
  const horariosDelServicio = estado.horarios.filter((h) => h.servicioId === servicio.id);

  // Calcular ocupación por horario en esa fecha
  grid.innerHTML = horariosDelServicio
    .map((h) => {
      const reservasEnEsteHorario = estado.reservas.filter(
        (r) => r.horarioId === h.id && r.fecha === fecha
      );
      const ocupados = reservasEnEsteHorario.length;
      const disponibles = h.capacidad - ocupados;
      const lleno = disponibles <= 0;

      return `
      <button
        class="horario-btn ${lleno ? "" : ""}"
        data-id="${h.id}"
        ${lleno ? "disabled" : ""}
      >
        ${h.hora}
        <span class="horario-btn__info">
          ${lleno ? "Sin lugares" : `${disponibles} lugar${disponibles !== 1 ? "es" : ""} — ${h.profesor}`}
        </span>
      </button>
    `;
    })
    .join("");

  stepHorarios.style.display = "block";
  document.getElementById("step-datos").style.display = "none";

  // Delegación de eventos en horarios
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".horario-btn");
    if (!btn || btn.disabled) return;

    const horarioId = parseInt(btn.dataset.id);
    seleccionarHorario(horarioId);
  });
}

function seleccionarHorario(id) {
  estado.seleccion.horario = estado.horarios.find((h) => h.id === id);

  // Marcar botón seleccionado
  document.querySelectorAll(".horario-btn").forEach((b) => b.classList.remove("selected"));
  document.querySelector(`.horario-btn[data-id="${id}"]`).classList.add("selected");

  // Mostrar paso de datos
  document.getElementById("step-datos").style.display = "block";
}

// ============================================================
// PASO 4 — CONFIRMAR RESERVA
// ============================================================

function setupConfirmar() {
  document.getElementById("btn-confirmar").addEventListener("click", () => {
    const nombre = document.getElementById("input-nombre").value.trim();
    const email = document.getElementById("input-email").value.trim();
    const { servicio, fecha, horario } = estado.seleccion;

    // Validaciones
    if (!nombre || !email) {
      Swal.fire({
        icon: "warning",
        title: "Datos incompletos",
        text: "Completá tu nombre y email para continuar.",
        confirmButtonText: "Entendido",
      });
      return;
    }

    if (!validarEmail(email)) {
      Swal.fire({
        icon: "warning",
        title: "Email inválido",
        text: "Ingresá un email con formato correcto.",
        confirmButtonText: "Corregir",
      });
      return;
    }

    // Confirmación con SweetAlert2
    Swal.fire({
      title: "¿Confirmás la reserva?",
      html: `
        <div style="text-align:left; line-height:2">
          <b>Clase:</b> ${servicio.icono} ${servicio.nombre}<br>
          <b>Fecha:</b> ${formatearFecha(fecha)}<br>
          <b>Hora:</b> ${horario.hora}hs<br>
          <b>Profesor:</b> ${horario.profesor}
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Reservar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) confirmarReserva(nombre, email);
    });
  });
}

function confirmarReserva(nombre, email) {
  const { servicio, fecha, horario } = estado.seleccion;

  const nuevaReserva = {
    id: Date.now(),
    nombre,
    email,
    servicioId: servicio.id,
    servicioNombre: servicio.nombre,
    servicioIcono: servicio.icono,
    horarioId: horario.id,
    hora: horario.hora,
    profesor: horario.profesor,
    fecha,
  };

  estado.reservas.push(nuevaReserva);
  guardarReservas();
  resetFormulario();

  Swal.fire({
    icon: "success",
    title: "¡Reserva confirmada!",
    html: `Tu turno para <b>${servicio.nombre}</b> el <b>${formatearFecha(fecha)}</b> a las <b>${horario.hora}hs</b> está listo.`,
    confirmButtonText: "Ver mis turnos",
  }).then(() => {
    // Navegar a mis turnos
    document.querySelector('[data-section="mis-turnos"]').click();
  });
}

// ============================================================
// MIS TURNOS
// ============================================================

function renderMisTurnos() {
  const container = document.getElementById("mis-turnos-container");

  if (estado.reservas.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🏃</div>
        <div class="empty-state__title">Sin turnos reservados</div>
        <div class="empty-state__text">Todavía no tenés clases agendadas. ¡Reservá una!</div>
      </div>
    `;
    return;
  }

  // Ordenar por fecha y hora
  const reservasOrdenadas = [...estado.reservas].sort((a, b) => {
    const fechaA = new Date(`${a.fecha}T${a.hora}`);
    const fechaB = new Date(`${b.fecha}T${b.hora}`);
    return fechaA - fechaB;
  });

  container.innerHTML = `
    <div class="turnos-lista">
      ${reservasOrdenadas.map((r) => renderTurnoCard(r)).join("")}
    </div>
  `;

  // Delegación de eventos para cancelar
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-danger");
    if (!btn) return;

    const reservaId = parseInt(btn.dataset.id);
    cancelarTurno(reservaId);
  });
}

function renderTurnoCard(reserva) {
  return `
    <div class="turno-card">
      <div class="turno-card__info">
        <div class="turno-card__servicio">${reserva.servicioIcono} ${reserva.servicioNombre}</div>
        <div class="turno-card__detalle">
          📅 ${formatearFecha(reserva.fecha)} &nbsp;·&nbsp;
          🕐 ${reserva.hora}hs &nbsp;·&nbsp;
          👤 ${reserva.profesor}<br>
          🙋 ${reserva.nombre} &nbsp;·&nbsp; ${reserva.email}
        </div>
      </div>
      <span class="turno-card__tag">CONFIRMADO</span>
      <button class="btn-danger" data-id="${reserva.id}">Cancelar</button>
    </div>
  `;
}

function cancelarTurno(id) {
  const reserva = estado.reservas.find((r) => r.id === id);
  if (!reserva) return;

  Swal.fire({
    title: "¿Cancelar turno?",
    html: `Vas a cancelar <b>${reserva.servicioNombre}</b> del <b>${formatearFecha(reserva.fecha)}</b> a las <b>${reserva.hora}hs</b>.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, cancelar",
    cancelButtonText: "Mantener turno",
  }).then((result) => {
    if (!result.isConfirmed) return;

    estado.reservas = estado.reservas.filter((r) => r.id !== id);
    guardarReservas();
    renderMisTurnos();

    Swal.fire({
      icon: "success",
      title: "Turno cancelado",
      text: "Tu reserva fue eliminada correctamente.",
      timer: 2000,
      showConfirmButton: false,
    });
  });
}

// ============================================================
// HELPERS
// ============================================================

function guardarReservas() {
  localStorage.setItem("pb_reservas", JSON.stringify(estado.reservas));
}

function resetFormulario() {
  estado.seleccion = { servicio: null, fecha: null, horario: null };

  document.querySelectorAll(".servicio-card").forEach((c) => c.classList.remove("selected"));
  document.getElementById("input-fecha").value = "";
  document.getElementById("input-nombre").value = "";
  document.getElementById("input-email").value = "";

  document.getElementById("step-fecha").style.display = "none";
  document.getElementById("step-horarios").style.display = "none";
  document.getElementById("step-datos").style.display = "none";
}

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatearFecha(fechaStr) {
  const [anio, mes, dia] = fechaStr.split("-");
  const dias = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const fecha = new Date(anio, mes - 1, dia);
  return `${dias[fecha.getDay()]} ${dia} ${meses[mes - 1]} ${anio}`;
}

// ============================================================
// ARRANQUE
// ============================================================

document.addEventListener("DOMContentLoaded", init);