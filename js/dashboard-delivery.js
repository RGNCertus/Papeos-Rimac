/* ============================================================
   PAPEO'S RÍMAC — dashboard-delivery.js
   Lógica exclusiva del panel de Delivery
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
   PEDIDOS — estado de contadores KPI
   ============================================================ */
let pendientes  = parseInt(document.getElementById('pedidosPendientes')?.textContent  || '4');
let entregados  = parseInt(document.getElementById('pedidosEntregados')?.textContent  || '7');

function actualizarKpiPedidos() {
  const elPend = document.getElementById('pedidosPendientes');
  const elEntr = document.getElementById('pedidosEntregados');
  if (elPend) elPend.textContent = pendientes;
  if (elEntr) elEntr.textContent = entregados;

  /* Actualizar badge de sección */
  const badge = document.querySelector('#pedidos .badge--urgente');
  if (badge) {
    badge.textContent = `${pendientes} pendiente${pendientes !== 1 ? 's' : ''}`;
    badge.style.display = pendientes > 0 ? '' : 'none';
  }
}

/* ============================================================
   PEDIDOS — botón RECOGER
   ============================================================ */
document.addEventListener('click', e => {
  const btnRecoger = e.target.closest('.btn-recoger');
  if (!btnRecoger || btnRecoger.disabled) return;

  const card = btnRecoger.closest('.pedido-card');
  if (!card) return;

  const id         = btnRecoger.dataset.id;
  const statusEl   = card.querySelector('.pedido-status');
  const btnEntregar = card.querySelector('.btn-entregar');

  /* Cambiar estado a "En camino" */
  statusEl.textContent = '🟡 En camino';
  statusEl.className   = 'pedido-status status-delivery--en-camino';

  btnRecoger.disabled     = true;
  btnRecoger.textContent  = '🛵 Recogido';
  if (btnEntregar) btnEntregar.disabled = false;

  /* Quitar clase urgente */
  card.classList.remove('pedido-card--urgente');

  window.mostrarToast(`Pedido #${id} recogido. ¡Buen viaje! 🛵`, 'exito');
});

/* ============================================================
   PEDIDOS — botón ENTREGADO
   ============================================================ */
document.addEventListener('click', e => {
  const btnEntregar = e.target.closest('.btn-entregar');
  if (!btnEntregar || btnEntregar.disabled) return;

  const card = btnEntregar.closest('.pedido-card');
  if (!card) return;

  const id       = btnEntregar.dataset.id;
  const statusEl = card.querySelector('.pedido-status');

  /* Cambiar estado a "Entregado" */
  statusEl.textContent = '🟢 Entregado';
  statusEl.className   = 'pedido-status status-delivery--entregado';

  btnEntregar.disabled = true;

  /* Reemplazar acciones por label de completado */
  const actionsEl = card.querySelector('.pedido-actions');
  if (actionsEl) {
    actionsEl.outerHTML = '<span class="pedido-completado-label">✅ Completado</span>';
  }

  /* Añadir clase entregado */
  card.classList.add('pedido-card--entregado');

  /* Fade suave */
  setTimeout(() => {
    card.style.transition = 'opacity 0.6s ease';
    card.style.opacity    = '0.55';
  }, 600);

  /* Actualizar contadores */
  pendientes  = Math.max(0, pendientes - 1);
  entregados  = entregados + 1;
  actualizarKpiPedidos();

  window.mostrarToast(`¡Pedido #${id} entregado exitosamente! ✅`, 'exito');
});

/* ============================================================
   PEDIDOS — simular llegada de nuevo pedido (demo)
   ============================================================ */
(function simularNuevoPedido() {
  /* Cada 3 minutos llega un pedido nuevo (solo para demo visual) */
  setTimeout(() => {
    const lista = document.getElementById('pedidosLista');
    if (!lista) return;

    const num   = String(Math.floor(Math.random() * 900) + 100).padStart(4, '0');
    const nombres = ['Roberto Díaz', 'Karina Flores', 'Miguel Torres', 'Susana Ríos'];
    const calles  = ['Jr. Ancash 210', 'Av. Pizarro 88', 'Jr. Bolívar 442', 'Calle Lima 67'];
    const pedidosDemo = [
      '🍗 Alitas BBQ x8 + papas fritas',
      '🍔 Hamburguesa Classic x2 + limonadas',
      '🍗 Alitas Teriyaki x10 + cerveza x2',
    ];

    const nombre  = nombres[Math.floor(Math.random() * nombres.length)];
    const calle   = calles[Math.floor(Math.random() * calles.length)];
    const pedido  = pedidosDemo[Math.floor(Math.random() * pedidosDemo.length)];
    const total   = (Math.floor(Math.random() * 60) + 30);

    const card = document.createElement('div');
    card.className = 'pedido-card pedido-card--urgente';
    card.style.animation = 'card-in 0.5s ease both';
    card.innerHTML = `
      <div class="pedido-card__header">
        <span class="pedido-num">#${num}</span>
        <span class="pedido-status status-delivery--pendiente">🔴 Pendiente</span>
        <span class="pedido-tiempo">⏱️ Ahora mismo</span>
      </div>
      <div class="pedido-card__body">
        <p class="pedido-cliente">👤 ${window.escapeHTML(nombre)}</p>
        <p class="pedido-direccion">📍 ${window.escapeHTML(calle)}, Rímac</p>
        <ul class="pedido-items-lista">
          <li>${pedido}</li>
        </ul>
      </div>
      <div class="pedido-card__footer">
        <span class="pedido-total">Total: <strong>S/ ${total}</strong></span>
        <div class="pedido-actions">
          <button class="btn-recoger" data-id="${num}">🛵 Recoger</button>
          <button class="btn-entregar" data-id="${num}" disabled>✅ Entregado</button>
        </div>
      </div>
    `;

    lista.prepend(card);

    pendientes++;
    actualizarKpiPedidos();

    window.mostrarToast(`¡Nuevo pedido #${num} recibido! 📦`, 'info');
  }, 3 * 60 * 1000); // 3 minutos
})();

/* ============================================================
   TIEMPO PROMEDIO — simulación dinámica
   ============================================================ */
(function simularTiempoPromedio() {
  const kpiEl = [...document.querySelectorAll('.kpi-label')]
    .find(el => el.textContent.includes('Promedio de entrega'));
  if (!kpiEl) return;
  const numEl = kpiEl.previousElementSibling;

  setInterval(() => {
    const base = 22 + Math.floor(Math.random() * 12);
    numEl.textContent = `${base} min`;
  }, 60_000);
})();

/* ============================================================
   IDEA — contador de caracteres y envío
   ============================================================ */
const ideaTextarea = document.getElementById('ideaTextoDelivery');
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
const btnEncuesta = document.getElementById('btnEnviarEncuestaDelivery');
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
    const span  = this.querySelector('span');
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
  const card = e.target.closest('.comunicado-card');
  if (!card) return;
  const body      = card.querySelector('.comunicado-card__body');
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
