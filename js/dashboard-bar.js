/* ============================================================
   PAPEO'S RÍMAC — dashboard-bar.js
   Lógica exclusiva del panel de Bar
   ============================================================ */

'use strict';

/* ============================================================
   TURNO — resaltar día actual
   ============================================================ */
(function resaltarDiaActual() {
  const hoy   = new Date().getDay();
  const orden = [1, 2, 3, 4, 5, 6, 0];
  const idx   = orden.indexOf(hoy);
  const dias  = document.querySelectorAll('.turno-semana-grid .dia-item');
  dias.forEach(d => d.classList.remove('dia-item--hoy'));
  if (dias[idx]) dias[idx].classList.add('dia-item--hoy');
})();

/* ============================================================
   HORA EN TIEMPO REAL
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
   CARTA DEL DÍA — marcar disponibilidad
   ============================================================ */
document.querySelectorAll('.trago-card:not(.trago-card--agotado)').forEach(card => {
  const tag = card.querySelector('.trago-tag--disponible');
  if (!tag) return;

  /* Click en la tarjeta para toggle disponibilidad */
  card.addEventListener('dblclick', () => {
    const disponible = tag.textContent.includes('Disponible');
    if (disponible) {
      tag.textContent = '⚠️ Sin ingrediente';
      tag.className   = 'trago-tag trago-tag--agotado';
      card.classList.add('trago-card--agotado');
      card.style.opacity = '0.5';
      window.mostrarToast(`"${card.querySelector('.trago-card__nombre').textContent}" marcado sin ingrediente.`, 'advertencia');
    } else {
      tag.textContent = '✅ Disponible';
      tag.className   = 'trago-tag trago-tag--disponible';
      card.classList.remove('trago-card--agotado');
      card.style.opacity = '';
      window.mostrarToast(`"${card.querySelector('.trago-card__nombre').textContent}" disponible nuevamente.`, 'exito');
    }
  });
});

/* Tooltip de doble click */
document.querySelectorAll('.trago-card:not(.trago-card--agotado)').forEach(card => {
  card.title = 'Doble click para cambiar disponibilidad';
});

/* ============================================================
   CONTADOR DE TRAGOS DISPONIBLES
   ============================================================ */
function actualizarContadorTragos() {
  const disponibles = document.querySelectorAll('.trago-tag--disponible').length;
  const kpiTragos = [...document.querySelectorAll('.kpi-label')]
    .find(el => el.textContent.includes('Tragos en carta'));
  if (kpiTragos) {
    kpiTragos.previousElementSibling.textContent = disponibles;
  }
}

/* Observar cambios en la carta */
const cartaGrid = document.querySelector('.carta-bar-grid');
if (cartaGrid) {
  new MutationObserver(actualizarContadorTragos).observe(cartaGrid, {
    subtree: true, characterData: true, childList: true, attributes: true
  });
}

/* ============================================================
   IDEA — contador de caracteres y envío
   ============================================================ */
const ideaTextarea = document.getElementById('ideaTextoBar');
const charCount    = document.getElementById('ideaCharCount');
const btnSubmit    = document.getElementById('btnSubmitIdea');

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

    const lista = document.querySelector('.ideas-lista') || crearListaIdeas();
    const item  = document.createElement('div');
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

    ideaTextarea.value = '';
    if (charCount) charCount.textContent = '0';
    window.mostrarToast('¡Propuesta enviada! La jefatura la revisará pronto. 💡', 'exito');
  });
}

function crearListaIdeas() {
  const seccion = document.getElementById('ideas');
  const lista   = document.createElement('div');
  lista.className = 'ideas-lista';
  seccion.appendChild(lista);
  return lista;
}

/* ============================================================
   ENCUESTA — validación y envío
   ============================================================ */
const btnEncuesta = document.getElementById('btnEnviarEncuestaBar');
if (btnEncuesta) {
  btnEncuesta.addEventListener('click', () => {
    const grupos      = document.querySelectorAll('#encuesta .encuesta-stars');
    const respondidas = [...grupos].filter(g => g.dataset.valor);

    if (respondidas.length < grupos.length) {
      window.mostrarToast(
        `Faltan ${grupos.length - respondidas.length} pregunta(s) por responder.`,
        'advertencia'
      );
      return;
    }

    btnEncuesta.disabled    = true;
    btnEncuesta.textContent = '✅ ¡Gracias por tu respuesta!';
    document.querySelectorAll('#encuesta .star-btn').forEach(s => {
      s.disabled = true;
      s.style.cursor = 'default';
    });

    window.mostrarToast('Respuesta registrada de forma anónima. 📊', 'exito');
  });
}

/* ============================================================
   LIKE en reconocimientos
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
   ANIMACIÓN KPI — contador numérico
   ============================================================ */
(function animarKpis() {
  document.querySelectorAll('.kpi-number').forEach(el => {
    const val = parseFloat(el.textContent);
    if (isNaN(val) || el.textContent.includes(':') || el.textContent.includes('min')) return;
    let actual = 0;
    const paso = val / 40;
    const timer = setInterval(() => {
      actual = Math.min(actual + paso, val);
      el.textContent = Number.isInteger(val) ? Math.round(actual) : actual.toFixed(1);
      if (actual >= val) clearInterval(timer);
    }, 30);
  });
})();

/* ============================================================
   LEER MÁS en comunicados
   ============================================================ */
document.addEventListener('click', e => {
  if (!e.target.classList.contains('btn-leer-mas')) return;
  const card     = e.target.closest('.comunicado-card');
  if (!card) return;
  const body     = card.querySelector('.comunicado-card__body');
  const expandido = card.dataset.expandido === 'true';
  body.style.display     = expandido ? '' : 'block';
  body.style.overflow    = expandido ? '' : 'visible';
  e.target.textContent   = expandido ? 'Leer más →' : 'Leer menos ↑';
  card.dataset.expandido = expandido ? 'false' : 'true';
});
