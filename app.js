const firebaseConfig = {
  apiKey: "AIzaSyCPwR0ARBsnYVv959WVIqEAEf57YniBvmk",
  authDomain: "cuceihub-udg.firebaseapp.com",
  databaseURL: "https://cuceihub-udg-default-rtdb.firebaseio.com",
  projectId: "cuceihub-udg",
  storageBucket: "cuceihub-udg.firebasestorage.app",
  messagingSenderId: "82545156726",
  appId: "1:82545156726:web:f07c3c7d20d8130b8af557"
};

firebase.initializeApp(firebaseConfig);
const dbRef = firebase.database().ref('cuceihub_db_v1');

// =========================================================
// DATOS INICIALES Y SINCRONIZACIÓN EN TIEMPO REAL
// =========================================================
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
        { alumnoId: 3, estado: 1 },
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

function normalizeDB(raw) {
  const data = raw || {};
  return {
    usuarios: data.usuarios || [],
    clases: data.clases || [],
    inscripciones: data.inscripciones || [],
    sesiones: (data.sesiones || []).map(s => ({ ...s, asistencias: s.asistencias || [] })),
    tareas: data.tareas || [],
    entregas: (data.entregas || []).map(e => ({ ...e, calificacion: e.calificacion ?? null, retroalimentacion: e.retroalimentacion || '' })),
    examenes: (data.examenes || []).map(ex => ({
      ...ex,
      preguntas: (ex.preguntas || []).map(p => ({ ...p, opciones: p.opciones || [] }))
    })),
    intentosExamen: (data.intentosExamen || []).map(i => ({ ...i, respuestas: i.respuestas || [] })),
    materiales: data.materiales || [],
    mensajes: data.mensajes || [],
    notificaciones: data.notificaciones || []
  };
}

let db = normalizeDB(initialDB);
let currentUser = null;
let selectedClaseId = null;
let activeTab = 'asistencia';

dbRef.on('value', (snapshot) => {
  const val = snapshot.val();
  if (!val) {
    saveDB(initialDB);
  } else {
    db = normalizeDB(val);
    if (currentUser) {
      const updatedUser = db.usuarios.find(u => u.idUsuario === currentUser.idUsuario);
      if (updatedUser) currentUser = updatedUser;
      const modalOpen = !document.getElementById('modal-backdrop').classList.contains('hidden');
      if (!modalOpen) renderApp();
    }
  }
});

function saveDB(data = db) {
  dbRef.set(data).catch(err => console.error('Error al guardar en Firebase:', err));
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
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="modalNuevoUsuario()">+ Registrar Usuario</button>
        <button class="btn btn-gold" onclick="modalNuevaClase()">+ Crear Clase</button>
        <button class="btn btn-danger" onclick="reiniciarDemo()">Reiniciar Datos Demo</button>
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
              <td>${u.nombre}${u.apellidos}</td>
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

window.reiniciarDemo = () => {
  if (confirm('¿Seguro que deseas restaurar los datos iniciales de prueba en la nube?')) {
    saveDB(initialDB);
  }
};

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
        <select id="c-docente">${docentes.map(d => `<option value="${d.idUsuario}">${d.nombre}${d.apellidos}</option>`).join('')}</select>
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
    grupo: document.getElementById('c-grupo').
