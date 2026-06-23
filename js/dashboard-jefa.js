/* ============================================================
   PAPEO'S RÍMAC — dashboard-jefa.js
   Lógica exclusiva del panel de Jefatura
   ============================================================ */

'use strict';

/* ============================================================
   TABS DE HORARIOS — cambiar área mostrada
   ============================================================ */
const HORARIOS_DATA = {
  salon: {
    colaboradores: [
      { nombre: 'Diana López',  turnos: ['T','T','—','T','T','N','—'] },
      { nombre: 'Jorge Quispe', turnos: ['T','—','T','T','T','N','N'] },
      { nombre: 'Andrea Soto',  turnos: ['—','T','T','—','T','T','N'] },
    ]
  },
  bar: {
    colaboradores: [
      { nombre: 'Bish Mamani', turnos: ['N','N','—','N','—','N','N'] },
      { nombre: 'Luis Vargas',  turnos: ['N','—','N','N','N','—','N'] },
    ]
  },
  cocina: {
    colaboradores: [
      { nombre: 'Silvana Ruiz',  turnos: ['T','T','T','—','T','T','—'] },
      { nombre: 'Dayana Torres', turnos: ['T','—','T','T','T','N','N'] },
      { nombre: 'Marco Pinto',  turnos: ['—','T','T','T','—','T','T'] },
    ]
  },
  delivery: {
    colaboradores: [
      { nombre: 'Angel Pérez',  turnos: ['T','—','T','T','T','N','N'] },
      { nombre: 'Raúl Huanca',  turnos: ['T','T','—','T','N','N','—'] },
    ]
  },
};

const CLASES_TURNO = { 'T': 'turno--tarde', 'N': 'turno--noche', '—': 'turno--libre' };
const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];

function renderizarHorario(area) {
  const tabla  = document.getElementById('horarioTabla');
  if (!tabla) return;

  const tbody  = tabla.querySelector('tbody');
  const data   = HORARIOS_DATA[area];
  if (!data) return;

  tbody.innerHTML = '';

  data.colaboradores.forEach(({ nombre, turnos }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="col-nombre">${nombre}</td>` +
      turnos.map(t => `<td><span class="turno ${CLASES_TURNO[t] || ''}">${t}</span></td>`).join('');
    tbody.appendChild(tr);
  });
}

/* Tabs click */
document.querySelectorAll('.horario-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.horario-tab').forEach(t => t.classList.remove('horario-tab--active'));
    tab.classList.add('horario-tab--active');
    renderizarHorario(tab.dataset.area);
  });
});

/* Render inicial */
renderizarHorario('salon');

/* ============================================================
   NUEVO COMUNICADO — modal simple
   ============================================================ */
const btnNuevoComunicado = document.getElementById('btnNuevoComunicado');
if (btnNuevoComunicado) {
  btnNuevoComunicado.addEventListener('click', () => {
    abrirModalComunicado();
  });
}

function abrirModalComunicado() {
  const modal = crearModal('📢 Nuevo Comunicado', `
    <div class="modal-form">
      <label class="form-label">Tipo</label>
      <select class="modal-select" id="mTipo">
        <option value="importante">🔴 Importante</option>
        <option value="info">🟡 Información</option>
        <option value="actividad">🟢 Actividad</option>
      </select>
      <label class="form-label">Título</label>
      <input type="text" class="modal-input" id="mTitulo" placeholder="Título del comunicado..." maxlength="80" />
      <label class="form-label">Contenido</label>
      <textarea class="modal-textarea" id="mContenido" placeholder="Escribe el comunicado aquí..." rows="4" maxlength="300"></textarea>
    </div>
  `, () => {
    const titulo    = document.getElementById('mTitulo')?.value.trim();
    const contenido = document.getElementById('mContenido')?.value.trim();
    const tipo      = document.getElementById('mTipo')?.value;

    if (!titulo || !contenido) {
      window.mostrarToast('Completa el título y el contenido.', 'advertencia');
      return false;
    }

    agregarComunicado(titulo, contenido, tipo);
    window.mostrarToast('Comunicado publicado exitosamente.', 'exito');
    return true;
  });
}

function agregarComunicado(titulo, contenido, tipo) {
  const grid = document.querySelector('.comunicados-grid');
  if (!grid) return;

  const etiquetas = {
    importante: '<span class="tag tag--importante">🔴 Importante</span>',
    info:       '<span class="tag tag--info">🟡 Información</span>',
    actividad:  '<span class="tag tag--actividad">🟢 Actividad</span>',
  };

  const hoy = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

  const card = document.createElement('article');
  card.className = `comunicado-card${tipo === 'importante' ? ' comunicado-card--importante' : ''}`;
  card.style.animation = 'card-in 0.4s ease both';
  card.innerHTML = `
    <div class="comunicado-card__top">
      ${etiquetas[tipo] || etiquetas.info}
      <span class="comunicado-fecha">${hoy}</span>
    </div>
    <h3 class="comunicado-card__title">${window.escapeHTML(titulo)}</h3>
    <p class="comunicado-card__body">${window.escapeHTML(contenido)}</p>
    <button class="btn-leer-mas">Leer más →</button>
  `;
  grid.prepend(card);
}

/* ============================================================
   NUEVO RECONOCIMIENTO
   ============================================================ */
const btnNuevoReconocimiento = document.getElementById('btnNuevoReconocimiento');
if (btnNuevoReconocimiento) {
  btnNuevoReconocimiento.addEventListener('click', () => {
    crearModal('🏆 Nuevo Reconocimiento', `
      <div class="modal-form">
        <label class="form-label">Nombre del colaborador</label>
        <input type="text" class="modal-input" id="rNombre" placeholder="Ej: Juan Pérez" maxlength="60" />
        <label class="form-label">Área</label>
        <select class="modal-select" id="rArea">
          <option value="salon">🍽️ Salón</option>
          <option value="bar">🍹 Bar</option>
          <option value="cocina">👨‍🍳 Cocina</option>
          <option value="delivery">🛵 Delivery</option>
        </select>
        <label class="form-label">Motivo del reconocimiento</label>
        <textarea class="modal-textarea" id="rMotivo" placeholder='"Describe por qué se reconoce a este colaborador..."' rows="3" maxlength="200"></textarea>
      </div>
    `, () => {
      const nombre = document.getElementById('rNombre')?.value.trim();
      const motivo = document.getElementById('rMotivo')?.value.trim();
      const area   = document.getElementById('rArea')?.value;

      if (!nombre || !motivo) {
        window.mostrarToast('Completa nombre y motivo del reconocimiento.', 'advertencia');
        return false;
      }

      agregarReconocimiento(nombre, motivo, area);
      window.mostrarToast(`¡Reconocimiento publicado para ${nombre}! 🏆`, 'exito');
      return true;
    });
  });
}

function agregarReconocimiento(nombre, motivo, area) {
  const grid = document.querySelector('.reconocimientos-grid');
  if (!grid) return;

  const areaLabels = {
    salon:    '🍽️ Salón',
    bar:      '🍹 Bar',
    cocina:   '👨‍🍳 Cocina',
    delivery: '🛵 Delivery',
  };

  const card = document.createElement('div');
  card.className = 'reconoc-card';
  card.style.animation = 'card-in 0.4s ease both';
  card.innerHTML = `
    <div class="reconoc-card__medal">⭐</div>
    <img src="assets/images/colaborador-default.jpg" alt="Foto" class="reconoc-card__foto" onerror="this.style.background='var(--verde-suave)';this.src='';" />
    <h3 class="reconoc-card__nombre">${window.escapeHTML(nombre)}</h3>
    <span class="reconoc-card__area area-chip area-chip--${area}">${areaLabels[area] || area}</span>
    <p class="reconoc-card__motivo">"${window.escapeHTML(motivo)}"</p>
    <div class="reconoc-card__likes">
      <button class="btn-like" aria-label="Me encanta">❤️ <span>0</span></button>
    </div>
  `;

  /* Re-vincular evento like al nuevo botón */
  card.querySelector('.btn-like').addEventListener('click', function () {
    const span  = this.querySelector('span');
    const liked = this.classList.toggle('liked');
    span.textContent = parseInt(span.textContent) + (liked ? 1 : -1);
  });

  grid.prepend(card);
}

/* ============================================================
   GESTIÓN DE IDEAS — botones aprobar / rechazar / revisión
   ============================================================ */
document.addEventListener('click', e => {
  const item = e.target.closest('.idea-item');
  if (!item) return;

  if (e.target.classList.contains('btn-aprobar')) {
    item.className = 'idea-item idea-item--aprobada';
    item.querySelector('.idea-status').className = 'idea-status status--aprobada';
    item.querySelector('.idea-status').textContent = '✅ Aprobada';
    item.querySelector('.idea-actions').innerHTML = '<button class="btn-ver-detalle">Ver detalle →</button>';
    window.mostrarToast('Idea aprobada exitosamente.', 'exito');
  }

  if (e.target.classList.contains('btn-revisar')) {
    item.querySelector('.idea-status').textContent = '🔄 En revisión';
    window.mostrarToast('Idea marcada como "En revisión".', 'info');
  }

  if (e.target.classList.contains('btn-rechazar')) {
    if (confirm('¿Estás segura de rechazar esta propuesta?')) {
      item.style.transition = 'opacity 0.4s, transform 0.4s';
      item.style.opacity    = '0';
      item.style.transform  = 'translateX(-20px)';
      setTimeout(() => item.remove(), 400);
      window.mostrarToast('Propuesta rechazada.', 'advertencia');
    }
  }
});

/* ============================================================
   BOTONES "Leer más" — expandir/colapsar comunicado
   ============================================================ */
document.addEventListener('click', e => {
  if (!e.target.classList.contains('btn-leer-mas')) return;
  const card = e.target.closest('.comunicado-card');
  if (!card) return;
  const body = card.querySelector('.comunicado-card__body');
  if (!body) return;

  const expandido = card.dataset.expandido === 'true';
  if (expandido) {
    body.style.webkitLineClamp = '3';
    body.style.overflow        = 'hidden';
    body.style.display         = '-webkit-box';
    body.style.webkitBoxOrient = 'vertical';
    e.target.textContent       = 'Leer más →';
    card.dataset.expandido     = 'false';
  } else {
    body.style.webkitLineClamp = 'unset';
    body.style.overflow        = 'visible';
    body.style.display         = 'block';
    e.target.textContent       = 'Leer menos ↑';
    card.dataset.expandido     = 'true';
  }
});

/* ============================================================
   AGREGAR COLABORADOR — modal
   ============================================================ */
const btnAgregarColaborador = document.getElementById('btnAgregarColaborador');
if (btnAgregarColaborador) {
  btnAgregarColaborador.addEventListener('click', () => {
    crearModal('👤 Agregar Colaborador', `
      <div class="modal-form">
        <label class="form-label">Nombre completo</label>
        <input type="text" class="modal-input" id="cNombre" placeholder="Ej: Ana García" maxlength="60" />
        <label class="form-label">Área</label>
        <select class="modal-select" id="cArea">
          <option value="salon">🍽️ Salón</option>
          <option value="bar">🍹 Bar</option>
          <option value="cocina">👨‍🍳 Cocina</option>
          <option value="delivery">🛵 Delivery</option>
        </select>
        <label class="form-label">Turno</label>
        <select class="modal-select" id="cTurno">
          <option value="Turno tarde">Tarde (17:00–23:30)</option>
          <option value="Turno noche">Noche (19:00–01:30)</option>
        </select>
        <label class="form-label">Teléfono de contacto</label>
        <input type="tel" class="modal-input" id="cTelefono" placeholder="Ej: 987-654-321" maxlength="20" />
      </div>
    `, () => {
      const nombre   = document.getElementById('cNombre')?.value.trim();
      const area     = document.getElementById('cArea')?.value;
      const turno    = document.getElementById('cTurno')?.value;
      const telefono = document.getElementById('cTelefono')?.value.trim();

      if (!nombre) {
        window.mostrarToast('Ingresa el nombre del colaborador.', 'advertencia');
        return false;
      }

      agregarColaboradorGrid(nombre, area, turno, telefono);
      window.mostrarToast(`Colaborador ${nombre} agregado exitosamente.`, 'exito');
      return true;
    });
  });
}

function agregarColaboradorGrid(nombre, area, turno, telefono) {
  const grid = document.querySelector('.equipo-grid');
  if (!grid) return;

  const areaLabels = { salon:'🍽️ Salón', bar:'🍹 Bar', cocina:'👨‍🍳 Cocina', delivery:'🛵 Delivery' };

  const card = document.createElement('div');
  card.className = 'equipo-card';
  card.style.animation = 'card-in 0.4s ease both';
  card.innerHTML = `
    <img src="assets/images/colaborador-default.jpg" alt="Foto" class="equipo-card__foto"
         onerror="this.style.background='var(--verde-suave)';this.src='';" />
    <div class="equipo-card__info">
      <h4 class="equipo-card__nombre">${window.escapeHTML(nombre)}</h4>
      <span class="area-chip area-chip--${area}">${areaLabels[area] || area}</span>
      <p class="equipo-card__detalle">${window.escapeHTML(turno)} · Ingresó: Jun 2026</p>
      ${telefono ? `<p class="equipo-card__contacto">📞 ${window.escapeHTML(telefono)}</p>` : ''}
    </div>
  `;
  grid.prepend(card);
}

/* ============================================================
   NUEVA ENCUESTA — modal
   ============================================================ */
const btnNuevaEncuesta = document.getElementById('btnNuevaEncuesta');
if (btnNuevaEncuesta) {
  btnNuevaEncuesta.addEventListener('click', () => {
    window.mostrarToast('Funcionalidad de creación de encuestas disponible próximamente. 📊', 'info');
  });
}

/* ============================================================
   HELPER: crear modal genérico
   ============================================================ */
function crearModal(titulo, contenidoHTML, onConfirmar) {
  /* Eliminar modal previo */
  document.querySelector('.papeos-modal-overlay')?.remove();

  /* Inyectar estilos del modal si no existen */
  if (!document.getElementById('papeos-modal-styles')) {
    const style = document.createElement('style');
    style.id = 'papeos-modal-styles';
    style.textContent = `
      .papeos-modal-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.6);
        z-index: 9998; display: flex; align-items: center; justify-content: center;
        animation: fade-in 0.25s ease;
      }
      .papeos-modal {
        background: var(--blanco); border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl); width: min(480px, 94vw);
        overflow: hidden; animation: modal-in 0.3s cubic-bezier(0.22,1,0.36,1);
      }
      .papeos-modal__header {
        background: linear-gradient(135deg, var(--verde-oscuro), var(--verde-base));
        color: var(--blanco); padding: 16px 20px;
        display: flex; align-items: center; justify-content: space-between;
      }
      .papeos-modal__header h3 { font-size: 1rem; font-weight: 700; }
      .papeos-modal__close { color: rgba(255,255,255,0.7); font-size: 1.1rem; transition: color 0.15s; }
      .papeos-modal__close:hover { color: #fff; }
      .papeos-modal__body { padding: 20px; }
      .papeos-modal__footer { padding: 12px 20px; display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--gris-200); }
      .modal-form { display: flex; flex-direction: column; gap: 10px; }
      .modal-input, .modal-select, .modal-textarea {
        width: 100%; font-family: var(--font-body); font-size: 0.88rem;
        border: 1.5px solid var(--gris-300); border-radius: var(--radius-sm);
        padding: 9px 12px; background: var(--gris-100); color: var(--gris-900);
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .modal-input:focus, .modal-select:focus, .modal-textarea:focus {
        outline: none; border-color: var(--verde-base);
        box-shadow: 0 0 0 3px rgba(56,142,60,0.15);
      }
      .modal-textarea { resize: vertical; }
      .btn-modal-cancelar {
        font-size: 0.85rem; font-weight: 600; padding: 8px 18px;
        border-radius: var(--radius-pill); background: var(--gris-200); color: var(--gris-700);
        transition: background 0.15s;
      }
      .btn-modal-cancelar:hover { background: var(--gris-300); }
      .btn-modal-confirmar {
        font-size: 0.85rem; font-weight: 700; padding: 8px 20px;
        border-radius: var(--radius-pill);
        background: linear-gradient(135deg, var(--verde-base), var(--verde-oscuro));
        color: var(--blanco); transition: all 0.15s; box-shadow: var(--shadow-sm);
      }
      .btn-modal-confirmar:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.className = 'papeos-modal-overlay';
  overlay.innerHTML = `
    <div class="papeos-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitulo">
      <div class="papeos-modal__header">
        <h3 id="modalTitulo">${titulo}</h3>
        <button class="papeos-modal__close" id="modalClose">✕</button>
      </div>
      <div class="papeos-modal__body">${contenidoHTML}</div>
      <div class="papeos-modal__footer">
        <button class="btn-modal-cancelar" id="modalCancelar">Cancelar</button>
        <button class="btn-modal-confirmar" id="modalConfirmar">Guardar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  const cerrar = () => {
    overlay.style.opacity = '0';
    setTimeout(() => { overlay.remove(); document.body.style.overflow = ''; }, 250);
  };

  overlay.querySelector('#modalClose').addEventListener('click', cerrar);
  overlay.querySelector('#modalCancelar').addEventListener('click', cerrar);
  overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

  overlay.querySelector('#modalConfirmar').addEventListener('click', () => {
    const ok = onConfirmar ? onConfirmar() : true;
    if (ok !== false) cerrar();
  });

  /* Focus primer input */
  setTimeout(() => overlay.querySelector('input, select, textarea')?.focus(), 100);

  return overlay;
}

/* Exponer para uso en otros módulos */
window.crearModal = crearModal;

/* ============================================================
   GESTIÓN DE CONTENIDO — tabs
   ============================================================ */
const paneles = {
  video:    document.getElementById('panelVideo'),
  encuesta: document.getElementById('panelEncuesta'),
  link:     document.getElementById('panelLink'),
};

document.querySelectorAll('.contenido-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    /* Activar tab */
    document.querySelectorAll('.contenido-tab').forEach(t => t.classList.remove('contenido-tab--active'));
    tab.classList.add('contenido-tab--active');

    /* Mostrar panel correspondiente */
    const tipo = tab.dataset.tipo;
    Object.entries(paneles).forEach(([key, panel]) => {
      if (panel) panel.hidden = key !== tipo;
    });
  });
});

/* ============================================================
   SUBIR VIDEO — drag & drop + input file
   ============================================================ */
const uploadArea    = document.getElementById('uploadArea');
const inputVideo    = document.getElementById('inputVideo');
const uploadPreview = document.getElementById('uploadPreview');
const previewVideo  = document.getElementById('previewVideo');
const previewInfo   = document.getElementById('previewInfo');
const btnQuitarVideo = document.getElementById('btnQuitarVideo');

let archivoVideoSeleccionado = null;

/* Drag & drop */
if (uploadArea) {
  uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      mostrarPreviewVideo(file);
    } else {
      window.mostrarToast('Por favor selecciona un archivo de video válido.', 'advertencia');
    }
  });
}

/* Input file change */
if (inputVideo) {
  inputVideo.addEventListener('change', () => {
    const file = inputVideo.files[0];
    if (file) mostrarPreviewVideo(file);
  });
}

function mostrarPreviewVideo(file) {
  archivoVideoSeleccionado = file;
  const url = URL.createObjectURL(file);
  previewVideo.src = url;

  /* Info del archivo */
  const tamanoMB = (file.size / 1024 / 1024).toFixed(1);
  previewInfo.innerHTML = `
    <span>📄 ${window.escapeHTML(file.name)}</span>
    <span>💾 ${tamanoMB} MB</span>
    <span>🎬 ${file.type}</span>
  `;

  uploadArea.hidden   = true;
  uploadPreview.hidden = false;
}

/* Quitar video seleccionado */
if (btnQuitarVideo) {
  btnQuitarVideo.addEventListener('click', () => {
    archivoVideoSeleccionado = null;
    previewVideo.src = '';
    if (inputVideo) inputVideo.value = '';
    uploadArea.hidden    = false;
    uploadPreview.hidden = true;
  });
}

/* ============================================================
   PUBLICAR VIDEO
   ============================================================ */
const btnPublicarVideo = document.getElementById('btnPublicarVideo');
if (btnPublicarVideo) {
  btnPublicarVideo.addEventListener('click', () => {
    const titulo = document.getElementById('videoTitulo')?.value.trim();
    const area   = document.getElementById('videoArea')?.value;
    const desc   = document.getElementById('videoDesc')?.value.trim();

    if (!titulo) {
      window.mostrarToast('Ingresa un título para el video.', 'advertencia');
      document.getElementById('videoTitulo')?.focus();
      return;
    }

    if (!archivoVideoSeleccionado) {
      window.mostrarToast('Selecciona un archivo de video primero.', 'advertencia');
      return;
    }

    /* Simular publicación (en producción se haría upload real) */
    agregarItemPublicado('video', titulo, desc, area);
    actualizarBadgeNotif();

    /* Limpiar formulario */
    document.getElementById('videoTitulo').value = '';
    document.getElementById('videoDesc').value   = '';
    if (btnQuitarVideo) btnQuitarVideo.click();

    window.mostrarToast(`¡Video "${titulo}" publicado exitosamente! 🎬`, 'exito');
  });
}

/* ============================================================
   PUBLICAR ENCUESTA (Google Forms)
   ============================================================ */
const btnPublicarEncuesta = document.getElementById('btnPublicarEncuesta');
if (btnPublicarEncuesta) {
  btnPublicarEncuesta.addEventListener('click', () => {
    const titulo = document.getElementById('encuestaTitulo')?.value.trim();
    const link   = document.getElementById('encuestaLink')?.value.trim();
    const fecha  = document.getElementById('encuestaFecha')?.value;
    const area   = document.getElementById('encuestaArea')?.value;

    if (!titulo) {
      window.mostrarToast('Ingresa un título para la encuesta.', 'advertencia');
      document.getElementById('encuestaTitulo')?.focus();
      return;
    }

    if (!link) {
      window.mostrarToast('Ingresa el link de Google Forms.', 'advertencia');
      document.getElementById('encuestaLink')?.focus();
      return;
    }

    /* Validar que sea un link de Google Forms */
    const esGoogleForms = link.includes('forms.gle') ||
                          link.includes('docs.google.com/forms') ||
                          link.includes('forms.google.com');

    if (!esGoogleForms) {
      window.mostrarToast('El link debe ser de Google Forms (forms.gle o docs.google.com/forms).', 'advertencia');
      document.getElementById('encuestaLink')?.focus();
      return;
    }

    const extra = fecha ? `Vence: ${new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}` : '';
    agregarItemPublicado('encuesta', titulo, extra, area, link);

    document.getElementById('encuestaTitulo').value = '';
    document.getElementById('encuestaLink').value   = '';
    document.getElementById('encuestaFecha').value  = '';

    window.mostrarToast(`¡Encuesta "${titulo}" publicada! El equipo ya puede responderla. 📋`, 'exito');
  });
}

/* ============================================================
   PUBLICAR LINK / RECURSO
   ============================================================ */
const btnPublicarLink = document.getElementById('btnPublicarLink');
if (btnPublicarLink) {
  btnPublicarLink.addEventListener('click', () => {
    const asunto = document.getElementById('linkAsunto')?.value.trim();
    const url    = document.getElementById('linkUrl')?.value.trim();
    const desc   = document.getElementById('linkDesc')?.value.trim();
    const tipo   = document.getElementById('linkTipo')?.value;
    const area   = document.getElementById('linkArea')?.value;

    if (!asunto) {
      window.mostrarToast('Ingresa el asunto del recurso.', 'advertencia');
      document.getElementById('linkAsunto')?.focus();
      return;
    }

    if (!url) {
      window.mostrarToast('Ingresa la URL del recurso.', 'advertencia');
      document.getElementById('linkUrl')?.focus();
      return;
    }

    try { new URL(url); } catch {
      window.mostrarToast('La URL no es válida. Asegúrate de incluir https://', 'advertencia');
      return;
    }

    agregarItemPublicado('link', asunto, desc, area, url, tipo);

    document.getElementById('linkAsunto').value = '';
    document.getElementById('linkUrl').value    = '';
    document.getElementById('linkDesc').value   = '';

    window.mostrarToast(`¡Recurso "${asunto}" publicado exitosamente! 🔗`, 'exito');
  });
}

/* ============================================================
   HELPER — agregar ítem a lista de publicados
   ============================================================ */
const AREA_LABELS = {
  todos:    '👥 Todos',
  salon:    '🍽️ Salón',
  bar:      '🍹 Bar',
  cocina:   '👨‍🍳 Cocina',
  delivery: '🛵 Delivery',
};

const TIPO_ICONOS = {
  video:      '🎬',
  encuesta:   '📋',
  link:       '🔗',
  documento:  '📄',
  'video-yt': '▶️',
  imagen:     '🖼️',
  otro:       '🔗',
};

function agregarItemPublicado(tipo, titulo, desc, area, url = null, subTipo = null) {
  const lista = document.getElementById('publicadoLista');
  if (!lista) return;

  const icono     = TIPO_ICONOS[subTipo || tipo] || '📁';
  const areaLabel = AREA_LABELS[area] || area;
  const areaChip  = area === 'todos' ? 'area-chip--jefa' : `area-chip--${area}`;
  const id        = `pub-${Date.now()}`;
  const ahora     = 'Ahora mismo';

  let tagHTML = '';
  if (tipo === 'video') {
    tagHTML = `<span class="publicado-tag publicado-tag--video">Video</span>`;
  } else if (tipo === 'encuesta' && url) {
    tagHTML = `<a href="${window.escapeHTML(url)}" class="publicado-tag publicado-tag--encuesta" target="_blank" rel="noopener">Google Forms ↗</a>`;
  } else if (tipo === 'link' && url) {
    tagHTML = `<a href="${window.escapeHTML(url)}" class="publicado-tag publicado-tag--link" target="_blank" rel="noopener">Abrir ↗</a>`;
  }

  const item = document.createElement('div');
  item.className = `publicado-item publicado-item--${tipo}`;
  item.dataset.id = id;
  item.style.animation = 'card-in 0.4s ease both';
  item.innerHTML = `
    <div class="publicado-item__icon">${icono}</div>
    <div class="publicado-item__info">
      <strong>${window.escapeHTML(titulo)}</strong>
      <span class="publicado-area area-chip ${areaChip}">${areaLabel}</span>
      <small>${desc ? window.escapeHTML(desc) + ' · ' : ''}${ahora}</small>
    </div>
    <div class="publicado-item__actions">
      ${tagHTML}
      <button class="btn-eliminar-publicado" data-id="${id}" title="Eliminar">🗑️</button>
    </div>
  `;
  lista.prepend(item);
}

/* ============================================================
   ELIMINAR ÍTEM PUBLICADO
   ============================================================ */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-eliminar-publicado');
  if (!btn) return;

  if (!confirm('¿Eliminar este contenido publicado?')) return;

  const item = btn.closest('.publicado-item');
  if (!item) return;

  item.style.transition = 'opacity 0.35s, transform 0.35s';
  item.style.opacity    = '0';
  item.style.transform  = 'translateX(20px)';
  setTimeout(() => item.remove(), 380);

  window.mostrarToast('Contenido eliminado.', 'info');
});

/* ============================================================
   ACTUALIZAR BADGE DE NOTIFICACIONES
   ============================================================ */
function actualizarBadgeNotif() {
  const badge = document.getElementById('notifBadge');
  if (!badge) return;
  const actual = parseInt(badge.textContent) || 0;
  badge.textContent = actual + 1;
}

/* ============================================================
   FECHA MÍNIMA para encuesta = hoy
   ============================================================ */
(function setFechaMin() {
  const inputFecha = document.getElementById('encuestaFecha');
  if (!inputFecha) return;
  const hoy = new Date().toISOString().split('T')[0];
  inputFecha.min = hoy;
  inputFecha.value = '';
})();