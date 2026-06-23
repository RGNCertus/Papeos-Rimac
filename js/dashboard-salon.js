/* ============================================================
   PAPEO'S RÍMAC — dashboard-salon.js
   Lógica exclusiva del panel de Salón
   ============================================================ */

'use strict';

/* ============================================================
   TURNO — resaltar día actual en la semana
   ============================================================ */
(function resaltarDiaActual() {
  const hoy      = new Date().getDay(); // 0=dom, 1=lun...
  const orden    = [1, 2, 3, 4, 5, 6, 0]; // lun a dom
  const idx      = orden.indexOf(hoy);
  const diasItem = document.querySelectorAll('.turno-semana-grid .dia-item');
  diasItem.forEach(d => d.classList.remove('dia-item--hoy'));
  if (diasItem[idx]) diasItem[idx].classList.add('dia-item--hoy');
})();

/* ============================================================
   ENVÍO DE IDEA — validación y feedback
   ============================================================ */
const btnSubmit   = document.getElementById('btnSubmitIdea');
const ideaTextarea = document.getElementById('ideaTextoSalon');
const charCount    = document.getElementById('ideaCharCount');

if (ideaTextarea && charCount) {
  ideaTextarea.addEventListener('input', () => {
    charCount.textContent = ideaTextarea.value.length;
  });
}

if (btnSubmit && ideaTextarea) {
  btnSubmit.addEventListener('click', () => {
    const texto = ideaTextarea.value.trim();

    if (texto.length < 10) {
      window.mostrarToast('Tu idea debe tener al menos 10 caracteres.', 'advertencia');
      ideaTextarea.focus();
      return;
    }

    publicarIdea(texto);
    ideaTextarea.value = '';
    if (charCount) charCount.textContent = '0';
    window.mostrarToast('¡Propuesta enviada! La jefatura la revisará pronto. 💡', 'exito');
  });
}

function publicarIdea(texto) {
  const lista = document.getElementById('ideasSalonLista');
  if (!lista) return;

  const item = document.createElement('div');
  item.className = 'idea-item idea-item--pendiente';
  item.style.animation = 'card-in 0.4s ease both';
  item.innerHTML = `
    <div class="idea-item__header">
      <span class="idea-status status--pendiente">⏳ Pendiente revisión</span>
      <span class="idea-fecha">Ahora mismo</span>
    </div>
    <p class="idea-texto">"${window.escapeHTML(texto)}"</p>
  `;
  lista.prepend(item);
}

/* ============================================================
   ENCUESTA — envío con validación de estrellas
   ============================================================ */
const btnEncuesta = document.getElementById('btnEnviarEncuestaSalon');
if (btnEncuesta) {
  btnEncuesta.addEventListener('click', () => {
    const grupos     = document.querySelectorAll('#encuesta .encuesta-stars');
    const respondidas = [...grupos].filter(g => g.dataset.valor);

    if (respondidas.length < grupos.length) {
      window.mostrarToast(
        `Faltan ${grupos.length - respondidas.length} pregunta(s) por responder.`,
        'advertencia'
      );
      return;
    }

    const respuestas = [...grupos].map(g => ({
      pregunta: g.dataset.pregunta,
      valor:    g.dataset.valor,
    }));

    console.info('Encuesta Salón:', respuestas);

    btnEncuesta.disabled     = true;
    btnEncuesta.textContent  = '✅ Respuesta enviada — ¡Gracias!';
    btnEncuesta.style.background = 'linear-gradient(135deg, var(--verde-base), var(--verde-oscuro))';

    /* Deshabilitar estrellas */
    document.querySelectorAll('#encuesta .star-btn').forEach(s => {
      s.disabled = true;
      s.style.cursor = 'default';
    });

    window.mostrarToast('¡Tu respuesta fue registrada de forma anónima! 📊', 'exito');
  });
}

/* ============================================================
   CALIFICACIÓN DEL TURNO — animación de KPI
   ============================================================ */
(function animarKpiCalificacion() {
  const kpis = document.querySelectorAll('.kpi-number');
  kpis.forEach(el => {
    const destino = parseFloat(el.textContent);
    if (isNaN(destino) || el.textContent.includes('min') || el.textContent.includes(':')) return;

    let actual = 0;
    const paso = destino / 40;
    const timer = setInterval(() => {
      actual = Math.min(actual + paso, destino);
      el.textContent = Number.isInteger(destino) ? Math.round(actual) : actual.toFixed(1);
      if (actual >= destino) clearInterval(timer);
    }, 30);
  });
})();

/* ============================================================
   HORA EN TIEMPO REAL — KPI reloj
   ============================================================ */
(function relojEnVivo() {
  function actualizar() {
    const el = document.getElementById('horaActual');
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString('es-PE', {
      hour: '2-digit', minute: '2-digit'
    });
  }
  actualizar();
  setInterval(actualizar, 10_000);
})();

/* ============================================================
   BOTONES "Leer más" — expandir comunicados
   ============================================================ */
document.addEventListener('click', e => {
  if (!e.target.classList.contains('btn-leer-mas')) return;
  const card = e.target.closest('.comunicado-card');
  if (!card) return;
  const body     = card.querySelector('.comunicado-card__body');
  const expandido = card.dataset.expandido === 'true';

  if (expandido) {
    body.style.display     = '';
    body.style.overflow    = '';
    e.target.textContent   = 'Leer más →';
    card.dataset.expandido = 'false';
  } else {
    body.style.display     = 'block';
    body.style.overflow    = 'visible';
    e.target.textContent   = 'Leer menos ↑';
    card.dataset.expandido = 'true';
  }
});

/* ============================================================
   RECONOCIMIENTO — botón like
   ============================================================ */
document.querySelectorAll('.btn-like').forEach(btn => {
  btn.addEventListener('click', function () {
    const span = this.querySelector('span');
    const liked = this.classList.toggle('liked');
    span.textContent = parseInt(span.textContent) + (liked ? 1 : -1);
    this.style.transform = 'scale(1.3)';
    setTimeout(() => { this.style.transform = ''; }, 200);
  });
});

/* ============================================================
   ESTADO DE MESAS — decorativo interactivo
   ============================================================ */
(function estadoMesas() {
  const kpiMesas = [...document.querySelectorAll('.kpi-label')]
    .find(el => el.textContent.includes('Mesas activas'));
  if (!kpiMesas) return;

  /* Fluctuar número de mesas cada minuto (simulación) */
  const numEl = kpiMesas.previousElementSibling;
  if (!numEl) return;

  setInterval(() => {
    const base   = 6;
    const variacion = Math.floor(Math.random() * 5);
    numEl.textContent = base + variacion;
  }, 60_000);
})();
