/* ============================================================
   PAPEO'S RÍMAC — dashboard-cocina.js
   Lógica exclusiva del panel de Cocina
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
   MENÚ DEL DÍA — toggle de disponibilidad por ítem
   ============================================================ */
document.querySelectorAll('.menu-item').forEach(item => {
  if (item.classList.contains('menu-item--agotado')) return;

  item.style.cursor = 'pointer';
  item.title = 'Click para cambiar disponibilidad';

  item.addEventListener('click', () => {
    const estadoEl = item.querySelector('.menu-item__estado');
    const nombre   = item.querySelector('.menu-item__nombre')?.textContent || 'Ítem';

    if (item.classList.contains('menu-item--disponible')) {
      /* Disponible → Sin insumo */
      item.className = 'menu-item menu-item--agotado';
      estadoEl.textContent = '❌ Sin insumo';
      estadoEl.className   = 'menu-item__estado estado--agotado';
      window.mostrarToast(`"${nombre}" marcado sin insumo. Notifica a la jefatura.`, 'advertencia');
    } else if (item.classList.contains('menu-item--limitado')) {
      /* Limitado → Sin insumo */
      item.className = 'menu-item menu-item--agotado';
      estadoEl.textContent = '❌ Sin insumo';
      estadoEl.className   = 'menu-item__estado estado--agotado';
      window.mostrarToast(`"${nombre}" marcado sin insumo.`, 'advertencia');
    }

    actualizarAlertaMenu();
    actualizarKpiAlitas();
  });
});

/* Restaurar ítem agotado con doble click */
document.querySelectorAll('.menu-item--agotado').forEach(item => {
  item.style.cursor = 'pointer';
  item.title = 'Doble click para marcar como disponible';
  item.addEventListener('dblclick', () => {
    const estadoEl = item.querySelector('.menu-item__estado');
    const nombre   = item.querySelector('.menu-item__nombre')?.textContent || 'Ítem';
    item.className = 'menu-item menu-item--disponible';
    estadoEl.textContent = '✅';
    estadoEl.className   = 'menu-item__estado estado--ok';
    window.mostrarToast(`"${nombre}" marcado como disponible.`, 'exito');
    actualizarAlertaMenu();
    actualizarKpiAlitas();
  });
});

function actualizarAlertaMenu() {
  const alerta    = document.getElementById('menuAlerta');
  const problemas = document.querySelectorAll('.menu-item--agotado, .menu-item--limitado');
  if (!alerta) return;

  if (problemas.length === 0) {
    alerta.style.display = 'none';
  } else {
    alerta.style.display = 'flex';
    const texto = alerta.querySelector('p');
    if (texto) {
      texto.innerHTML = `Hay <strong>${problemas.length}</strong> ítem${problemas.length > 1 ? 's' : ''} con stock bajo o sin insumos. Informa a la encargada antes de continuar el turno.`;
    }
  }
}

function actualizarKpiAlitas() {
  const disponibles = document.querySelectorAll('.menu-item--disponible .menu-item__nombre');
  const alitas = [...disponibles].filter(el =>
    el.closest('.menu-categoria__title') === null &&
    el.closest('.menu-categoria')?.querySelector('.menu-categoria__title')?.textContent.includes('Alitas')
  );

  /* Buscar KPI de alitas */
  const kpiEl = [...document.querySelectorAll('.kpi-label')]
    .find(el => el.textContent.includes('Sabores de alitas'));
  if (kpiEl) {
    const disponiblesAlitas = document.querySelectorAll(
      '.menu-categoria:first-child .menu-item--disponible'
    ).length;
    kpiEl.previousElementSibling.textContent = disponiblesAlitas;
  }
}

/* ============================================================
   TIEMPO PROMEDIO DE ORDEN — simulación dinámica
   ============================================================ */
(function simularTiempoOrden() {
  const kpiTiempo = [...document.querySelectorAll('.kpi-label')]
    .find(el => el.textContent.includes('promedio de orden'));
  if (!kpiTiempo) return;
  const numEl = kpiTiempo.previousElementSibling;

  setInterval(() => {
    const base     = 10;
    const variacion = Math.floor(Math.random() * 6);
    numEl.textContent = `${base + variacion} min`;
  }, 45_000);
})();

/* ============================================================
   IDEA — contador de caracteres y envío
   ============================================================ */
const ideaTextarea = document.getElementById('ideaTextoCocina');
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

    const lista = document.querySelector('.ideas-lista');
    if (lista) {
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

    ideaTextarea.value = '';
    if (charCount) charCount.textContent = '0';
    window.mostrarToast('¡Propuesta enviada! La jefatura la revisará pronto. 💡', 'exito');
  });
}

/* ============================================================
   ENCUESTA — validación y envío
   ============================================================ */
const btnEncuesta = document.getElementById('btnEnviarEncuestaCocina');
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
