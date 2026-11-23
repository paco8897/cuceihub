// =========================================================
// MODELO DE DATOS Y PERSISTENCIA (Basado en UML CuceiHub)
// =========================================================
const STORAGE_KEY = 'cuceihub_db_v1';

function initDB() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const initialDB = {
    usuarios: [
      { idUsuario: 1, clave: 'ADM-001', nombre: 'Admin', apellidos: 'CUCEI', correo: 'admin@cucei.udg.mx', contrasena: '1234', rol: 'ADMINISTRADOR', activo: true, area: 'Coordinación Académica' },
      { idUsuario: 2, clave: 'DOC-101', nombre: 'Sabrina Lizbeth', apellidos: 'Vega Maldonado', correo: 'sabrina.vega@academicos.udg.mx', contrasena: '1234', rol: 'DOCENTE', activo: true, departamento: 'Ciencias Computacionales' },
      { idUsuario: 3, clave: '222928473', nombre: 'Francisco Javier', apellidos: 'Domínguez Castro', correo: 'francisco.dominguez@alumnos.udg.mx', contrasena: '1234', rol: 'ALUMNO', activo: true, carrera: 'Ing. en Informática', semestre: 4 },
      { idUsuario: 4, clave: '325019628', nombre: 'Alfonso', apellidos: 'Ixtlahuac Murillo', correo: 'alfonso.ixtlahuac@alumnos.udg.mx', contrasena: '1234', rol: 'ALUMNO', activo: true, carrera: 'Ing. en Informática', semestre: 4 },
      { idUsuario: 5, clave: '325019849', nombre: 'Alberto', apellidos: 'Arriaga Hernández', correo: 'alberto.arriaga@alumnos.udg.mx', contrasena: '1234', rol: 'ALUMNO', activo: true, carrera: 'Ing. en Informática', semestre: 4 }
    ],
    clases: [
      {
        idClase: 101,
        nombre: 'Programación Orientada a Objetos',
        codigo: 'I5886',
        grupo: 'D02',
        horario: 'Martes y Jueves 11:00 - 13:00',
        periodo: '2026-B',
        docenteId: 2,
        pesoTareas: 0.4,
        pesoExamenes: 0.4,
        pesoAsistencia: 0.2
      }
    ],
    inscripciones: [
      { idInscripcion: 1, claseId: 101, alumnoId: 3, activa: true },
      { idInscripcion: 2, claseId: 101, alumnoId: 4, activa: true },
      { idInscripcion: 3, claseId: 101, alumnoId: 5, activa: true }
    ],
    sesiones: [
      {
        idSesion: 1,
        claseId: 101,
        fecha: '2026-11-19',
        tema: 'Diagramas de Clases y Relaciones UML',
        asistencias: [
          { alumnoId: 3, estado: 1 }, // 1: Asistencia, 2: Retardo, 3: Falta
          { alumnoId: 4, estado: 1 },
          { alumnoId: 5, estado: 2 }
        ]
      }
    ],
    tareas: [
      {
        idTarea: 1,
        claseId: 101,
        titulo: 'Modelado UML de CuceiHub',
        descripcion: 'Entregar el diccionario de clases y diagramas de casos de uso y actividades.',
        fechaLimite: '2026-11-30',
        puntosMaximos: 10
      }
    ],
    entregas: [
      {
        idEntrega: 1,
        tareaId: 1,
        alumnoId: 3,
        textoRespuesta: 'Adjunto documento PDF con los 4 diagramas UML completos.',
        nombreArchivo: 'CuceiHub-Proyecto.pdf',
        fechaEntrega: '2026-11-23 14:10',
        estado: 'ENTREGADA',
        calificacion: null,
        retroalimentacion: ''
      }
    ],
    examenes: [
      {
        idExamen: 1,
        claseId: 101,
        titulo: 'Parcial 2: Pilares de POO y UML',
        fechaAplicacion: '2026-11-23',
        horaInicio: '11:00',
        duracionMinutos: 30,
        estado: 'ACTIVO',
        preguntas: [
          { idPregunta: 1, tipo: 'A', enunciado: '¿Qué relación UML indica que la parte no existe sin el todo?', opciones: ['Asociación', 'Composición', 'Agregación'], correcta: 1, puntos: 4 },
          { idPregunta: 2, tipo: 'B', enunciado: 'Una clase abstracta en Java puede instanciarse directamente con new.', opciones: ['Verdadero', 'Falso'], correcta: 1, puntos: 3 },
          { idPregunta: 3, tipo: 'C', enunciado: 'Explica brevemente la diferencia entre herencia e interfaz.', opciones: [], correcta: null, puntos: 3 }
        ]
      }
    ],
    intentosExamen: [],
    materiales: [
      {
        idMaterial: 1,
        claseId: 101,
        unidad: 'Unidad 2: Modelado UML',
        titulo: 'Guía de Notación UML 2.5',
        tipo: 'DOCUMENTO',
        enlace: 'https://www.uml.org/'
      }
    ],
    mensajes: [
      { idMensaje: 1, claseId: 101, remitenteId: 2, texto: 'Bienvenidos al curso de POO. Pueden usar este chat para dudas del proyecto.', fecha: '11:05 AM' }
    ],
    notificaciones: [
      { idNotif: 1, usuarioId: 3, titulo: 'Nuevo Examen Activo', mensaje: 'Parcial 2: Pilares de POO y UML ya está disponible.', leida: false }
    ]
  };

  saveDB(initialDB);
  return initialDB;
}

let db = initDB();
let currentUser = null;
let selectedClaseId = null;
let activeTab = 'asistencia';

function saveDB(data = db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addNotification(usuarioId, titulo, mensaje) {
  db.notificaciones.unshift({
    idNotif: Date.now() + Math.random(),
    usuarioId,
    titulo,
    mensaje,
    leida: false
  });
  saveDB();
}

// =========================================================
// AUTENTICACIÓN Y NAVEGACIÓN
// =========================================================
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const clave = document.getElementById('login-clave').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  const user = db.usuarios.find(u => u.clave === clave && u.contrasena === pass && u.activo);
  if (!user) {
    document.getElementById('login-error').classList.remove('hidden');
    return;
  }

  document.getElementById('login-error').classList.add('hidden');
  currentUser = user;
  selectedClaseId = null;
  renderApp();
});

document.getElementById('btn-logout').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('app-view').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
});

document.getElementById('btn-notifications').addEventListener('click', () => {
  document.getElementById('notif-dropdown').classList.toggle('hidden');
});

document.getElementById('btn-clear-notifs').addEventListener('click', () => {
  db.notificaciones.filter(n => n.usuarioId === currentUser.idUsuario).forEach(n => n.leida = true);
  saveDB();
  renderNotifications();
});

document.getElementById('modal-close').addEventListener('click', closeModal);
function openModal(title, htmlContent) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = htmlContent;
  document.getElementById('modal-backdrop').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-backdrop').classList.add('hidden');
}

function renderApp() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-view').classList.remove('hidden');
  document.getElementById('user-display-name').textContent = `${currentUser.nombre} ${currentUser.apellidos}`;
  document.getElementById('user-role-badge').textContent = currentUser.rol;

  renderNotifications();

  if (currentUser.rol === 'ADMINISTRADOR') {
    renderAdminDashboard();
  } else if (!selectedClaseId) {
    renderClasesList();
  } else {
    renderClaseDetail();
  }
}

function renderNotifications() {
  const myNotifs = db.notificaciones.filter(n => n.usuarioId === currentUser.idUsuario);
  const unread = myNotifs.filter(n => !n.leida).length;
  document.getElementById('notif-count').textContent = unread;

  const list = document.getElementById('notif-list');
  if (myNotifs.length === 0) {
    list.innerHTML = '<div class="notif-item">Sin notificaciones.</div>';
    return;
  }
  list.innerHTML = myNotifs.map(n => `
    <div class="notif-item ${n.leida ? '' : 'unread'}">
      <strong>${n.titulo}</strong><br/>
      <span>${n.mensaje}</span>
    </div>
  `).join('');
}

// =========================================================
// VISTA DE ADMINISTRADOR
// =========================================================
function renderAdminDashboard() {
  const main = document.getElementById('main-content');
  main.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      <h2>Panel de Administración CUCEI</h2>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-primary" onclick="modalNuevoUsuario()">+ Registrar Usuario</button>
        <button class="btn btn-gold" onclick="modalNuevaClase()">+ Crear Clase</button>
      </div>
    </div>

    <div class="card" style="margin-top:1rem;">
      <h3>Usuarios Registrados</h3>
      <table>
        <thead><tr><th>Clave / Matrícula</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Acción</th></tr></thead>
        <tbody>
          ${db.usuarios.map(u => `
            <tr>
              <td><strong>${u.clave}</strong></td>
              <td>${u.nombre} ${u.apellidos}</td>
              <td>${u.rol}</td>
              <td>${u.activo ? 'Activo' : 'Inactivo'}</td>
              <td>
                ${u.rol !== 'ADMINISTRADOR' ? `<button class="btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}" onclick="toggleUsuario(${u.idUsuario})">${u.activo ? 'Desactivar' : 'Activar'}</button>` : '-'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-top:1rem;">
      <h3>Clases Activas e Inscripciones</h3>
      <table>
        <thead><tr><th>Código</th><th>Materia</th><th>Grupo</th><th>Docente</th><th>Inscritos</th><th>Acción</th></tr></thead>
        <tbody>
          ${db.clases.map(c => {
            const doc = db.usuarios.find(u => u.idUsuario === c.docenteId);
            const count = db.inscripciones.filter(i => i.claseId === c.idClase && i.activa).length;
            return `
              <tr>
                <td>${c.codigo}</td>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.grupo}</td>
                <td>${doc ? doc.nombre + ' ' + doc.apellidos : 'Sin asignar'}</td>
                <td>${count} alumnos</td>
                <td><button class="btn btn-sm btn-primary" onclick="modalInscribirAlumno(${c.idClase})">Inscribir Alumno</button></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

window.toggleUsuario = (id) => {
  const u = db.usuarios.find(x => x.idUsuario === id);
  if (u) { u.activo = !u.activo; saveDB(); renderAdminDashboard(); }
};

window.modalNuevoUsuario = () => {
  openModal('Registrar Nuevo Usuario', `
    <form onsubmit="crearUsuario(event)">
      <div class="form-group"><label>Rol</label>
        <select id="u-rol"><option value="ALUMNO">ALUMNO</option><option value="DOCENTE">DOCENTE</option></select>
      </div>
      <div class="form-group"><label>Matrícula o Núm. Empleado</label><input id="u-clave" required /></div>
      <div class="form-group"><label>Nombre(s)</label><input id="u-nombre" required /></div>
      <div class="form-group"><label>Apellidos</label><input id="u-apellidos" required /></div>
      <div class="form-group"><label>Contraseña</label><input id="u-pass" value="1234" required /></div>
      <button type="submit" class="btn btn-primary btn-block">Guardar Usuario</button>
    </form>
  `);
};

window.crearUsuario = (e) => {
  e.preventDefault();
  db.usuarios.push({
    idUsuario: Date.now(),
    clave: document.getElementById('u-clave').value.trim(),
    nombre: document.getElementById('u-nombre').value.trim(),
    apellidos: document.getElementById('u-apellidos').value.trim(),
    contrasena: document.getElementById('u-pass').value.trim(),
    rol: document.getElementById('u-rol').value,
    activo: true
  });
  saveDB(); closeModal(); renderAdminDashboard();
};

window.modalNuevaClase = () => {
  const docentes = db.usuarios.filter(u => u.rol === 'DOCENTE' && u.activo);
  openModal('Crear Nueva Clase', `
    <form onsubmit="crearClase(event)">
      <div class="form-group"><label>Nombre de la Materia</label><input id="c-nombre" required /></div>
      <div class="form-group"><label>Código (ej. I5886)</label><input id="c-codigo" required /></div>
      <div class="form-group"><label>Grupo (ej. D02)</label><input id="c-grupo" required /></div>
      <div class="form-group"><label>Horario</label><input id="c-horario" placeholder="Lunes y Miércoles 9:00 - 11:00" required /></div>
      <div class="form-group"><label>Docente Asignado</label>
        <select id="c-docente">${docentes.map(d => `<option value="${d.idUsuario}">${d.nombre} ${d.apellidos}</option>`).join('')}</select>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Crear Clase</button>
    </form>
  `);
};

window.crearClase = (e) => {
  e.preventDefault();
  db.clases.push({
    idClase: Date.now(),
    nombre: document.getElementById('c-nombre').value.trim(),
    codigo: document.getElementById('c-codigo').value.trim(),
    grupo: document.getElementById('c-grupo').value.trim(),
    horario: document.getElementById('c-horario').value.trim(),
    docenteId: Number(document.getElementById('c-docente').value),
    pesoTareas: 0.4, pesoExamenes: 0.4, pesoAsistencia: 0.2
  });
  saveDB(); closeModal(); renderAdminDashboard();
};

window.modalInscribirAlumno = (claseId) => {
  const alumnos = db.usuarios.filter(u => u.rol === 'ALUMNO' && u.activo);
  openModal('Inscribir Alumno a la Clase', `
    <form onsubmit="inscribirAlumno(event, ${claseId})">
      <div class="form-group"><label>Selecciona Alumno</label>
        <select id="ins-alumno">${alumnos.map(a => `<option value="${a.idUsuario}">${a.clave} - ${a.nombre} ${a.apellidos}</option>`).join('')}</select>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Inscribir</button>
    </form>
  `);
};

window.inscribirAlumno = (e, claseId) => {
  e.preventDefault();
  const alumnoId = Number(document.getElementById('ins-alumno').value);
  const exists = db.inscripciones.some(i => i.claseId === claseId && i.alumnoId === alumnoId);
  if (!exists) {
    db.inscripciones.push({ idInscripcion: Date.now(), claseId, alumnoId, activa: true });
    saveDB();
  }
  closeModal(); renderAdminDashboard();
};

// =========================================================
// LISTA DE CLASES (DOCENTE Y ALUMNO)
// =========================================================
function renderClasesList() {
  const main = document.getElementById('main-content');
  let misClases = [];

  if (currentUser.rol === 'DOCENTE') {
    misClases = db.clases.filter(c => c.docenteId === currentUser.idUsuario);
  } else {
    const inscIds = db.inscripciones.filter(i => i.alumnoId === currentUser.idUsuario && i.activa).map(i => i.claseId);
    misClases = db.clases.filter(c => inscIds.includes(c.idClase));
  }

  main.innerHTML = `
    <h2>Mis Clases (${currentUser.rol === 'DOCENTE' ? 'Impartidas' : 'Inscritas'})</h2>
    <div class="grid-cards">
      ${misClases.map(c => {
        const doc = db.usuarios.find(u => u.idUsuario === c.docenteId);
        return `
          <div class="card">
            <span class="role-badge" style="background:var(--udg-blue); color:#fff;">${c.codigo} · Grupo ${c.grupo}</span>
            <h3 style="margin-top:0.6rem;">${c.nombre}</h3>
            <p class="meta-text">Horario: ${c.horario}<br/>Docente: ${doc ? doc.nombre + ' ' + doc.apellidos : ''}</p>
            <button class="btn btn-primary btn-block" onclick="entrarClase(${c.idClase})">Entrar a la Clase</button>
          </div>
        `;
      }).join('') || '<p>No tienes clases asignadas aún.</p>'}
    </div>
  `;
}

window.entrarClase = (idClase) => {
  selectedClaseId = idClase;
  activeTab = 'asistencia';
  renderClaseDetail();
};

window.volverAClases = () => {
  selectedClaseId = null;
  renderClasesList();
};

// =========================================================
// DETALLE DE CLASE Y MÓDULOS FUNCIONALES
// =========================================================
function renderClaseDetail() {
  const clase = db.clases.find(c => c.idClase === selectedClaseId);
  const main = document.getElementById('main-content');

  main.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
      <div>
        <button class="link-btn" onclick="volverAClases()">← Volver a mis clases</button>
        <h2 style="color:var(--udg-blue);">${clase.nombre} (${clase.codigo} - ${clase.grupo})</h2>
        <p class="meta-text">${clase.horario}</p>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn ${activeTab === 'asistencia' ? 'active' : ''}" onclick="switchTab('asistencia')">Asistencia</button>
      <button class="tab-btn ${activeTab === 'tareas' ? 'active' : ''}" onclick="switchTab('tareas')">Tareas</button>
      <button class="tab-btn ${activeTab === 'examenes' ? 'active' : ''}" onclick="switchTab('examenes')">Exámenes</button>
      <button class="tab-btn ${activeTab === 'materiales' ? 'active' : ''}" onclick="switchTab('materiales')">Materiales</button>
      <button class="tab-btn ${activeTab === 'chat' ? 'active' : ''}" onclick="switchTab('chat')">Chat de Clase</button>
      <button class="tab-btn ${activeTab === 'reporte' ? 'active' : ''}" onclick="switchTab('reporte')">Calificaciones Finales</button>
    </div>

    <div id="tab-content"></div>
  `;

  if (activeTab === 'asistencia') renderTabAsistencia(clase);
  if (activeTab === 'tareas') renderTabTareas(clase);
  if (activeTab === 'examenes') renderTabExamenes(clase);
  if (activeTab === 'materiales') renderTabMateriales(clase);
  if (activeTab === 'chat') renderTabChat(clase);
  if (activeTab === 'reporte') renderTabReporte(clase);
}

window.switchTab = (tab) => {
  activeTab = tab;
  renderClaseDetail();
};

// --- CÁLCULOS ACADÉMICOS ---
function getAlumnosClase(claseId) {
  const ids = db.inscripciones.filter(i => i.claseId === claseId && i.activa).map(i => i.alumnoId);
  return db.usuarios.filter(u => ids.includes(u.idUsuario));
}

function calcularEstadisticasAlumno(claseId, alumnoId) {
  // 1. Asistencia (Estado 1 = 100%, Estado 2 Retardo = 50%, Estado 3 Falta = 0%)
  const sesiones = db.sesiones.filter(s => s.claseId === claseId);
  let asist = 0, retardos = 0, faltas = 0;
  sesiones.forEach(s => {
    const reg = s.asistencias.find(a => a.alumnoId === alumnoId);
    if (reg) {
      if (reg.estado === 1) asist++;
      else if (reg.estado === 2) retardos++;
      else faltas++;
    }
  });
  const totalSesiones = sesiones.length;
  const pctAsistencia = totalSesiones > 0 ? (((asist + retardos * 0.5) / totalSesiones) * 100) : 100;

  // 2. Promedio Tareas (escala 0-10)
  const tareas = db.tareas.filter(t => t.claseId === claseId);
  let sumaTareas = 0;
  tareas.forEach(t => {
    const ent = db.entregas.find(e => e.tareaId === t.idTarea && e.alumnoId === alumnoId);
    if (ent && ent.calificacion !== null) sumaTareas += Number(ent.calificacion);
  });
  const promTareas = tareas.length > 0 ? (sumaTareas / tareas.length) : 0;

  // 3. Promedio Exámenes (escala 0-10)
  const examenes = db.examenes.filter(ex => ex.claseId === claseId);
  let sumaEx = 0;
  examenes.forEach(ex => {
    const int = db.intentosExamen.find(i => i.examenId === ex.idExamen && i.alumnoId === alumnoId);
    if (int) {
      const maxPts = ex.preguntas.reduce((acc, p) => acc + Number(p.puntos), 0) || 10;
      sumaEx += (int.puntajeObtenido / maxPts) * 10;
    }
  });
  const promExamenes = examenes.length > 0 ? (sumaEx / examenes.length) : 0;

  const clase = db.clases.find(c => c.idClase === claseId);
  const califFinal = (promTareas * clase.pesoTareas) + (promExamenes * clase.pesoExamenes) + ((pctAsistencia / 10) * clase.pesoAsistencia);

  return {
    asist, retardos, faltas,
    pctAsistencia: pctAsistencia.toFixed(1),
    promTareas: promTareas.toFixed(2),
    promExamenes: promExamenes.toFixed(2),
    califFinal: califFinal.toFixed(2)
  };
}

// --- TAB 1: ASISTENCIA ---
function renderTabAsistencia(clase) {
  const container = document.getElementById('tab-content');
  const sesiones = db.sesiones.filter(s => s.claseId === clase.idClase);

  if (currentUser.rol === 'DOCENTE') {
    const alumnos = getAlumnosClase(clase.idClase);
    container.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3>Pase de Lista por Sesión</h3>
          <button class="btn btn-primary" onclick="modalNuevaSesion(${clase.idClase})">+ Tomar Nueva Asistencia</button>
        </div>
        ${sesiones.map(s => `
          <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border);">
            <strong>Fecha: ${s.fecha}</strong> — Tema: ${s.tema}
            <table>
              <thead><tr><th>Matrícula</th><th>Alumno</th><th>Estado Actual</th><th>Cambiar Estado</th></tr></thead>
              <tbody>
                ${alumnos.map(al => {
                  const reg = s.asistencias.find(a => a.alumnoId === al.idUsuario) || { estado: 3 };
                  const label = reg.estado === 1 ? '1 - Asistencia' : reg.estado === 2 ? '2 - Retardo' : '3 - Falta';
                  return `
                    <tr>
                      <td>${al.clave}</td>
                      <td>${al.nombre} ${al.apellidos}</td>
                      <td><span class="status-pill pill-${reg.estado}">${label}</span></td>
                      <td>
                        <select onchange="cambiarAsistencia(${s.idSesion}, ${al.idUsuario}, this.value)">
                          <option value="1" ${reg.estado === 1 ? 'selected' : ''}>1 - Asistencia</option>
                          <option value="2" ${reg.estado === 2 ? 'selected' : ''}>2 - Retardo</option>
                          <option value="3" ${reg.estado === 3 ? 'selected' : ''}>3 - Falta</option>
                        </select>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    const stats = calcularEstadisticasAlumno(clase.idClase, currentUser.idUsuario);
    container.innerHTML = `
      <div class="card">
        <h3>Mi Resumen de Asistencia</h3>
        <p class="meta-text">Asistencias: <strong>${stats.asist}</strong> | Retardos: <strong>${stats.retardos}</strong> | Faltas: <strong>${stats.faltas}</strong> | Porcentaje: <strong>${stats.pctAsistencia}%</strong></p>
        <table>
          <thead><tr><th>Fecha</th><th>Tema de Sesión</th><th>Estado</th></tr></thead>
          <tbody>
            ${sesiones.map(s => {
              const reg = s.asistencias.find(a => a.alumnoId === currentUser.idUsuario) || { estado: 3 };
              const label = reg.estado === 1 ? 'Asistencia' : reg.estado === 2 ? 'Retardo' : 'Falta';
              return `<tr><td>${s.fecha}</td><td>${s.tema}</td><td><span class="status-pill pill-${reg.estado}">${label}</span></td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

window.modalNuevaSesion = (claseId) => {
  const alumnos = getAlumnosClase(claseId);
  openModal('Registrar Asistencia de Sesión', `
    <form onsubmit="guardarSesion(event, ${claseId})">
      <div class="form-group"><label>Fecha</label><input type="date" id="ses-fecha" value="2026-11-23" required /></div>
      <div class="form-group"><label>Tema visto en clase</label><input id="ses-tema" required /></div>
      <table>
        <thead><tr><th>Alumno</th><th>Estado</th></tr></thead>
        <tbody>
          ${alumnos.map(a => `
            <tr>
              <td>${a.nombre} ${a.apellidos}</td>
              <td>
                <select id="est-${a.idUsuario}">
                  <option value="1">1 - Asistencia</option>
                  <option value="2">2 - Retardo</option>
                  <option value="3">3 - Falta</option>
                </select>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <button type="submit" class="btn btn-primary btn-block" style="margin-top:1rem;">Guardar Pase de Lista</button>
    </form>
  `);
};

window.guardarSesion = (e, claseId) => {
  e.preventDefault();
  const alumnos = getAlumnosClase(claseId);
  const asistencias = alumnos.map(a => ({
    alumnoId: a.idUsuario,
    estado: Number(document.getElementById(`est-${a.idUsuario}`).value)
  }));
  db.sesiones.push({
    idSesion: Date.now(),
    claseId,
    fecha: document.getElementById('ses-fecha').value,
    tema: document.getElementById('ses-tema').value.trim(),
    asistencias
  });
  saveDB(); closeModal(); renderClaseDetail();
};

window.cambiarAsistencia = (sesionId, alumnoId, nuevoEstado) => {
  const ses = db.sesiones.find(s => s.idSesion === sesionId);
  const reg = ses.asistencias.find(a => a.alumnoId === alumnoId);
  if (reg) reg.estado = Number(nuevoEstado);
  saveDB(); renderClaseDetail();
};

// --- TAB 2: TAREAS ---
function renderTabTareas(clase) {
  const container = document.getElementById('tab-content');
  const tareas = db.tareas.filter(t => t.claseId === clase.idClase);

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3>Tareas de la Clase</h3>
      ${currentUser.rol === 'DOCENTE' ? `<button class="btn btn-primary" onclick="modalNuevaTarea(${clase.idClase})">+ Publicar Tarea</button>` : ''}
    </div>
    <div class="grid-cards">
      ${tareas.map(t => {
        if (currentUser.rol === 'DOCENTE') {
          const entregas = db.entregas.filter(e => e.tareaId === t.idTarea);
          return `
            <div class="card">
              <h3>${t.titulo}</h3>
              <p class="meta-text">Entrega límite: ${t.fechaLimite} · Valor: ${t.puntosMaximos} pts</p>
              <p style="font-size:0.9rem; margin-bottom:1rem;">${t.descripcion}</p>
              <button class="btn btn-gold btn-sm" onclick="modalRevisarEntregas(${t.idTarea})">Ver Entregas (${entregas.length})</button>
            </div>
          `;
        } else {
          const miEntrega = db.entregas.find(e => e.tareaId === t.idTarea && e.alumnoId === currentUser.idUsuario);
          return `
            <div class="card">
              <h3>${t.titulo}</h3>
              <p class="meta-text">Límite: ${t.fechaLimite} · Valor: ${t.puntosMaximos} pts</p>
              <p style="font-size:0.9rem; margin-bottom:0.75rem;">${t.descripcion}</p>
              ${miEntrega ? `
                <div style="background:#f0fdf4; padding:0.6rem; border-radius:6px; font-size:0.85rem;">
                  <strong>Estado:</strong> ${miEntrega.estado}<br/>
                  <strong>Calificación:</strong> ${miEntrega.calificacion !== null ? miEntrega.calificacion + ' / 10' : 'Pendiente de revisión'}<br/>
                  ${miEntrega.retroalimentacion ? `<strong>Retroalimentación:</strong> ${miEntrega.retroalimentacion}` : ''}
                </div>
              ` : `<button class="btn btn-primary btn-sm" onclick="modalEntregarTarea(${t.idTarea})">Entregar Tarea</button>`}
            </div>
          `;
        }
      }).join('')}
    </div>
  `;
}

window.modalNuevaTarea = (claseId) => {
  openModal('Crear Nueva Tarea', `
    <form onsubmit="crearTarea(event, ${claseId})">
      <div class="form-group"><label>Título</label><input id="t-titulo" required /></div>
      <div class="form-group"><label>Descripción</label><textarea id="t-desc" rows="3" required></textarea></div>
      <div class="form-group"><label>Fecha Límite</label><input type="date" id="t-fecha" value="2026-12-05" required /></div>
      <button type="submit" class="btn btn-primary btn-block">Publicar Tarea</button>
    </form>
  `);
};

window.crearTarea = (e, claseId) => {
  e.preventDefault();
  const titulo = document.getElementById('t-titulo').value.trim();
  db.tareas.push({
    idTarea: Date.now(),
    claseId,
    titulo,
    descripcion: document.getElementById('t-desc').value.trim(),
    fechaLimite: document.getElementById('t-fecha').value,
    puntosMaximos: 10
  });
  getAlumnosClase(claseId).forEach(al => addNotification(al.idUsuario, 'Nueva Tarea', `Se publicó: ${titulo}`));
  saveDB(); closeModal(); renderClaseDetail();
};

window.modalEntregarTarea = (tareaId) => {
  openModal('Entregar Tarea', `
    <form onsubmit="enviarEntrega(event, ${tareaId})">
      <div class="form-group"><label>Respuesta o Comentario</label><textarea id="ent-texto" rows="3" required></textarea></div>
      <div class="form-group"><label>Adjuntar Archivo (Simulado)</label><input type="file" id="ent-file" /></div>
      <button type="submit" class="btn btn-success btn-block">Enviar Entrega</button>
    </form>
  `);
};

window.enviarEntrega = (e, tareaId) => {
  e.preventDefault();
  const fileInput = document.getElementById('ent-file');
  const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'entrega_sin_archivo.txt';
  db.entregas.push({
    idEntrega: Date.now(),
    tareaId,
    alumnoId: currentUser.idUsuario,
    textoRespuesta: document.getElementById('ent-texto').value.trim(),
    nombreArchivo: fileName,
    fechaEntrega: new Date().toLocaleString(),
    estado: 'ENTREGADA',
    calificacion: null,
    retroalimentacion: ''
  });
  saveDB(); closeModal(); renderClaseDetail();
};

window.modalRevisarEntregas = (tareaId) => {
  const entregas = db.entregas.filter(e => e.tareaId === tareaId);
  openModal('Entregas de Alumnos', entregas.length === 0 ? '<p>Aún no hay entregas.</p>' : entregas.map(ent => {
    const al = db.usuarios.find(u => u.idUsuario === ent.alumnoId);
    return `
      <div style="border-bottom:1px solid var(--border); padding-bottom:1rem; margin-bottom:1rem;">
        <strong>${al.clave} - ${al.nombre} ${al.apellidos}</strong><br/>
        <small>Archivo: ${ent.nombreArchivo} | ${ent.fechaEntrega}</small>
        <p style="margin:0.5rem 0; background:#f8fafc; padding:0.5rem;">${ent.textoRespuesta}</p>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <input type="number" id="cal-${ent.idEntrega}" min="0" max="10" step="0.1" placeholder="0 - 10" value="${ent.calificacion ?? ''}" style="width:90px; padding:0.4rem;" />
          <input type="text" id="retro-${ent.idEntrega}" placeholder="Retroalimentación..." value="${ent.retroalimentacion}" style="flex:1; padding:0.4rem;" />
          <button class="btn btn-sm btn-primary" onclick="calificarEntrega(${ent.idEntrega})">Guardar</button>
        </div>
      </div>
    `;
  }).join(''));
};

window.calificarEntrega = (idEntrega) => {
  const ent = db.entregas.find(e => e.idEntrega === idEntrega);
  ent.calificacion = Number(document.getElementById(`cal-${idEntrega}`).value);
  ent.retroalimentacion = document.getElementById(`retro-${idEntrega}`).value.trim();
  ent.estado = 'CALIFICADA';
  addNotification(ent.alumnoId, 'Tarea Calificada', `Obtuviste ${ent.calificacion}/10 en tu entrega.`);
  saveDB(); closeModal(); renderClaseDetail();
};

// --- TAB 3: EXÁMENES (Tipos A, B y C) ---
function renderTabExamenes(clase) {
  const container = document.getElementById('tab-content');
  const examenes = db.examenes.filter(ex => ex.claseId === clase.idClase);

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3>Exámenes de la Clase</h3>
      ${currentUser.rol === 'DOCENTE' ? `<button class="btn btn-primary" onclick="modalCrearExamen(${clase.idClase})">+ Crear Examen</button>` : ''}
    </div>
    <div class="grid-cards">
      ${examenes.map(ex => {
        if (currentUser.rol === 'DOCENTE') {
          const intentos = db.intentosExamen.filter(i => i.examenId === ex.idExamen);
          return `
            <div class="card">
              <h3>${ex.titulo}</h3>
              <p class="meta-text">Fecha: ${ex.fechaAplicacion} (${ex.horaInicio}) · Duración: ${ex.duracionMinutos} min</p>
              <p class="meta-text">Preguntas: ${ex.preguntas.length}</p>
              <button class="btn btn-gold btn-sm" onclick="modalRevisarExamenes(${ex.idExamen})">Revisar Intentos (${intentos.length})</button>
            </div>
          `;
        } else {
          const intento = db.intentosExamen.find(i => i.examenId === ex.idExamen && i.alumnoId === currentUser.idUsuario);
          return `
            <div class="card">
              <h3>${ex.titulo}</h3>
              <p class="meta-text">Duración: ${ex.duracionMinutos} min · Estado: ${ex.estado}</p>
              ${intento ? `
                <div style="background:#eff6ff; padding:0.6rem; border-radius:6px; font-size:0.85rem;">
                  <strong>Examen Enviado</strong><br/>
                  Puntaje obtenido: <strong>${intento.puntajeObtenido} pts</strong> (${intento.estado})
                </div>
              ` : `<button class="btn btn-primary btn-sm" onclick="modalResponderExamen(${ex.idExamen})">Responder Examen</button>`}
            </div>
          `;
        }
      }).join('')}
    </div>
  `;
}

window.modalCrearExamen = (claseId) => {
  openModal('Crear Nuevo Examen (Preguntas A, B y C)', `
    <form onsubmit="guardarExamen(event, ${claseId})">
      <div class="form-group"><label>Título del Examen</label><input id="ex-titulo" required /></div>
      <div class="form-group"><label>Duración (minutos)</label><input type="number" id="ex-dur" value="25" required /></div>
      <hr style="margin:1rem 0;" />
      <div class="form-group"><label>Pregunta Tipo A (Opción Múltiple - 4 pts)</label>
        <input id="p1-enun" placeholder="Enunciado" required style="margin-bottom:0.4rem;" />
        <input id="p1-op0" placeholder="Opción 1 (Correcta)" required style="margin-bottom:0.3rem;" />
        <input id="p1-op1" placeholder="Opción 2" required />
      </div>
      <div class="form-group"><label>Pregunta Tipo B (Verdadero/Falso - 3 pts)</label>
        <input id="p2-enun" placeholder="Afirmación" required style="margin-bottom:0.4rem;" />
        <select id="p2-corr"><option value="0">Verdadero</option><option value="1">Falso</option></select>
      </div>
      <div class="form-group"><label>Pregunta Tipo C (Respuesta Abierta - 3 pts)</label>
        <input id="p3-enun" placeholder="Pregunta abierta para revisión docente" required />
      </div>
      <button type="submit" class="btn btn-primary btn-block">Publicar Examen</button>
    </form>
  `);
};

window.guardarExamen = (e, claseId) => {
  e.preventDefault();
  db.examenes.push({
    idExamen: Date.now(),
    claseId,
    titulo: document.getElementById('ex-titulo').value.trim(),
    fechaAplicacion: '2026-11-23',
    horaInicio: '11:00',
    duracionMinutos: Number(document.getElementById('ex-dur').value),
    estado: 'ACTIVO',
    preguntas: [
      { idPregunta: 1, tipo: 'A', enunciado: document.getElementById('p1-enun').value, opciones: [document.getElementById('p1-op0').value, document.getElementById('p1-op1').value], correcta: 0, puntos: 4 },
      { idPregunta: 2, tipo: 'B', enunciado: document.getElementById('p2-enun').value, opciones: ['Verdadero', 'Falso'], correcta: Number(document.getElementById('p2-corr').value), puntos: 3 },
      { idPregunta: 3, tipo: 'C', enunciado: document.getElementById('p3-enun').value, opciones: [], correcta: null, puntos: 3 }
    ]
  });
  saveDB(); closeModal(); renderClaseDetail();
};

window.modalResponderExamen = (examenId) => {
  const ex = db.examenes.find(x => x.idExamen === examenId);
  openModal(ex.titulo, `
    <form onsubmit="enviarExamen(event, ${examenId})">
      ${ex.preguntas.map((p, idx) => `
        <div class="form-group" style="border-bottom:1px solid var(--border); padding-bottom:0.75rem;">
          <label>${idx + 1}. [Tipo ${p.tipo} - ${p.puntos} pts] ${p.enunciado}</label>
          ${p.tipo === 'C'
            ? `<textarea id="resp-${p.idPregunta}" rows="2" required></textarea>`
            : p.opciones.map((op, i) => `
                <div><label style="font-weight:normal;"><input type="radio" name="resp-${p.idPregunta}" value="${i}" required /> ${op}</label></div>
              `).join('')
          }
        </div>
      `).join('')}
      <button type="submit" class="btn btn-success btn-block">Finalizar y Enviar Examen</button>
    </form>
  `);
};

window.enviarExamen = (e, examenId) => {
  e.preventDefault();
  const ex = db.examenes.find(x => x.idExamen === examenId);
  let puntajeAuto = 0;
  let tieneAbierta = false;
  const respuestas = [];

  ex.preguntas.forEach(p => {
    if (p.tipo === 'C') {
      tieneAbierta = true;
      const txt = document.getElementById(`resp-${p.idPregunta}`).value.trim();
      respuestas.push({ idPregunta: p.idPregunta, tipo: 'C', texto: txt, puntos: 0 });
    } else {
      const sel = Number(document.querySelector(`input[name="resp-${p.idPregunta}"]:checked`).value);
      const pts = sel === p.correcta ? p.puntos : 0;
      puntajeAuto += pts;
      respuestas.push({ idPregunta: p.idPregunta, tipo: p.tipo, seleccion: sel, puntos: pts });
    }
  });

  db.intentosExamen.push({
    idIntento: Date.now(),
    examenId,
    alumnoId: currentUser.idUsuario,
    puntajeObtenido: puntajeAuto,
    estado: tieneAbierta ? 'PENDIENTE_ABIERTA' : 'CALIFICADO',
    respuestas
  });
  saveDB(); closeModal(); renderClaseDetail();
};

window.modalRevisarExamenes = (examenId) => {
  const ex = db.examenes.find(x => x.idExamen === examenId);
  const intentos = db.intentosExamen.filter(i => i.examenId === examenId);
  openModal('Revisión de Exámenes', intentos.length === 0 ? '<p>Aún no hay intentos.</p>' : intentos.map(int => {
    const al = db.usuarios.find(u => u.idUsuario === int.alumnoId);
    const respAbierta = int.respuestas.find(r => r.tipo === 'C');
    const pregAbierta = ex.preguntas.find(p => p.tipo === 'C');
    return `
      <div style="border-bottom:1px solid var(--border); padding-bottom:1rem; margin-bottom:1rem;">
        <strong>${al.nombre} ${al.apellidos}</strong> — Puntaje actual: <strong>${int.puntajeObtenido} pts</strong>
        ${respAbierta ? `
          <p style="margin:0.4rem 0; font-size:0.85rem;"><em>Pregunta abierta:</em> ${pregAbierta.enunciado}<br/>
          <strong>Respuesta del alumno:</strong> ${respAbierta.texto}</p>
          <div style="display:flex; gap:0.5rem;">
            <input type="number" id="pts-ab-${int.idIntento}" min="0" max="${pregAbierta.puntos}" step="0.5" placeholder="Pts (max ${pregAbierta.puntos})" />
            <button class="btn btn-sm btn-primary" onclick="calificarAbierta(${int.idIntento}, ${respAbierta.idPregunta})">Asignar Puntos</button>
          </div>
        ` : ''}
      </div>
    `;
  }).join(''));
};

window.calificarAbierta = (idIntento, idPregunta) => {
  const int = db.intentosExamen.find(i => i.idIntento === idIntento);
  const r = int.respuestas.find(x => x.idPregunta === idPregunta);
  const nuevosPts = Number(document.getElementById(`pts-ab-${idIntento}`).value);
  int.puntajeObtenido = (int.puntajeObtenido - r.puntos) + nuevosPts;
  r.puntos = nuevosPts;
  int.estado = 'CALIFICADO';
  addNotification(int.alumnoId, 'Examen Calificado', `Tu calificación final del examen es ${int.puntajeObtenido} pts.`);
  saveDB(); closeModal(); renderClaseDetail();
};

// --- TAB 4: MATERIALES ---
function renderTabMateriales(clase) {
  const container = document.getElementById('tab-content');
  const mats = db.materiales.filter(m => m.claseId === clase.idClase);
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3>Contenidos y Materiales por Unidad</h3>
      ${currentUser.rol === 'DOCENTE' ? `<button class="btn btn-primary" onclick="modalNuevoMaterial(${clase.idClase})">+ Subir Material</button>` : ''}
    </div>
    <div class="grid-cards">
      ${mats.map(m => `
        <div class="card">
          <span class="role-badge" style="background:#e0e7ff; color:var(--udg-blue);">${m.unidad}</span>
          <h3 style="margin-top:0.5rem;">${m.titulo}</h3>
          <p class="meta-text">Tipo: ${m.tipo}</p>
          <a href="${m.enlace}" target="_blank" class="btn btn-gold btn-sm">Abrir / Descargar Recurso</a>
        </div>
      `).join('')}
    </div>
  `;
}

window.modalNuevoMaterial = (claseId) => {
  openModal('Subir Material de Clase', `
    <form onsubmit="guardarMaterial(event, ${claseId})">
      <div class="form-group"><label>Unidad o Tema</label><input id="m-unidad" placeholder="Unidad 3: Herencia y Polimorfismo" required /></div>
      <div class="form-group"><label>Título del Material</label><input id="m-titulo" required /></div>
      <div class="form-group"><label>Tipo</label>
        <select id="m-tipo"><option>DOCUMENTO</option><option>PRESENTACION</option><option>VIDEO</option><option>ENLACE</option></select>
      </div>
      <div class="form-group"><label>Enlace o URL del archivo</label><input type="url" id="m-enlace" value="https://docs.oracle.com/javase/tutorial/" required /></div>
      <button type="submit" class="btn btn-primary btn-block">Publicar Material</button>
    </form>
  `);
};

window.guardarMaterial = (e, claseId) => {
  e.preventDefault();
  db.materiales.push({
    idMaterial: Date.now(),
    claseId,
    unidad: document.getElementById('m-unidad').value.trim(),
    titulo: document.getElementById('m-titulo').value.trim(),
    tipo: document.getElementById('m-tipo').value,
    enlace: document.getElementById('m-enlace').value.trim()
  });
  saveDB(); closeModal(); renderClaseDetail();
};

// --- TAB 5: CHAT ---
function renderTabChat(clase) {
  const container = document.getElementById('tab-content');
  const msgs = db.mensajes.filter(m => m.claseId === clase.idClase);
  container.innerHTML = `
    <div class="card">
      <h3>Chat de la Clase (Docente - Alumnos)</h3>
      <div class="chat-box" style="margin-top:0.75rem;">
        <div class="chat-messages" id="chat-msgs">
          ${msgs.map(m => {
            const rem = db.usuarios.find(u => u.idUsuario === m.remitenteId);
            const isMine = m.remitenteId === currentUser.idUsuario;
            return `
              <div class="msg ${isMine ? 'mine' : 'other'}">
                <div class="msg-meta">${rem ? rem.nombre + ' (' + rem.rol + ')' : ''} · ${m.fecha}</div>
                <div>${m.texto}</div>
              </div>
            `;
          }).join('')}
        </div>
        <form class="chat-input-row" onsubmit="enviarMensajeChat(event, ${clase.idClase})">
          <input type="text" id="chat-input" placeholder="Escribe un mensaje o duda..." required />
          <button type="submit" class="btn btn-primary" style="border-radius:0;">Enviar</button>
        </form>
      </div>
    </div>
  `;
}

window.enviarMensajeChat = (e, claseId) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  db.mensajes.push({
    idMensaje: Date.now(),
    claseId,
    remitenteId: currentUser.idUsuario,
    texto: input.value.trim(),
    fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  saveDB(); renderClaseDetail();
};

// --- TAB 6: REPORTE FINAL ---
function renderTabReporte(clase) {
  const container = document.getElementById('tab-content');
  const alumnos = currentUser.rol === 'DOCENTE' ? getAlumnosClase(clase.idClase) : [currentUser];

  container.innerHTML = `
    <div class="card">
      <h3>Reporte de Desempeño y Calificación Final</h3>
      <p class="meta-text">Ponderación: Tareas 40% | Exámenes 40% | Asistencia 20%</p>
      <table>
        <thead>
          <tr>
            <th>Matrícula</th>
            <th>Alumno</th>
            <th>Asist. / Ret. / Faltas</th>
            <th>% Asistencia</th>
            <th>Prom. Tareas</th>
            <th>Prom. Exámenes</th>
            <th>Calificación Final</th>
          </tr>
        </thead>
        <tbody>
          ${alumnos.map(al => {
            const st = calcularEstadisticasAlumno(clase.idClase, al.idUsuario);
            return `
              <tr>
                <td><strong>${al.clave}</strong></td>
                <td>${al.nombre} ${al.apellidos}</td>
                <td>${st.asist} / ${st.retardos} / ${st.faltas}</td>
                <td>${st.pctAsistencia}%</td>
                <td>${st.promTareas}</td>
                <td>${st.promExamenes}</td>
                <td><strong style="color:var(--udg-blue); font-size:1rem;">${st.califFinal}</strong></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}