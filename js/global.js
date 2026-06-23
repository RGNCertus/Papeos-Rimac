/* ============================================================
   PAPEO'S RÍMAC — global.js
   Funciones compartidas: navbar, notificaciones, video, logout
   Cargar ANTES del JS específico de cada dashboard
   ============================================================ */

'use strict';

/* ============================================================
   VERIFICAR SESIÓN ACTIVA
   ============================================================ */
(function verificarSesion() {
  if (sessionStorage.getItem('papeos_logueado') !== 'true') {
    window.location.href = 'index.html';
  }
})();

/* ============================================================
   DATOS DE SESIÓN
   ============================================================ */
const SESSION = {
  usuario: sessionStorage.getItem('papeos_usuario') || '',
  nombre:  sessionStorage.getItem('papeos_nombre')  || 'Colaborador',
  area:    sessionStorage.getItem('papeos_area')    || '',
};

/* ============================================================
   FECHA Y HORA
   ============================================================ */
function formatearFecha(fecha) {
  const dias   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const meses  = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

function actualizarFechaHora() {
  const ahora = new Date();

  /* Fecha del hero */
  const elFecha = document.getElementById('fechaHoy');
  if (elFecha) elFecha.textContent = formatearFecha(ahora);

  /* Hora actual en KPI */
  const elHora = document.getElementById('horaActual');
  if (elHora) {
    elHora.textContent = ahora.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  /* Día de la semana en turno */
  const elDia = document.getElementById('diaHoy');
  if (elDia) {
    const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
    elDia.textContent = dias[ahora.getDay()];
  }
}

actualizarFechaHora();
setInterval(actualizarFechaHora, 60_000);

/* ============================================================
   NOMBRE EN NAVBAR Y HERO
   ============================================================ */
(function inyectarNombre() {
  const elNombre = document.getElementById('profileName');
  if (elNombre) elNombre.textContent = SESSION.nombre;

  const elHero = document.getElementById('heroNombre');
  if (elHero) elHero.textContent = SESSION.nombre;
})();

/* ============================================================
   NAVBAR — hamburger (mobile)
   ============================================================ */
const btnHamburger = document.getElementById('btnHamburger');
const mainNav      = document.getElementById('mainNav');

if (btnHamburger && mainNav) {
  btnHamburger.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    btnHamburger.textContent = mainNav.classList.contains('open') ? '✕' : '☰';
  });

  /* Cerrar al hacer click en un enlace */
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      btnHamburger.textContent = '☰';
    });
  });
}

/* ============================================================
   NAVBAR — nav-link activo según scroll
   ============================================================ */
(function activarNavScroll() {
  const secciones = document.querySelectorAll('main section[id], section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  if (!secciones.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  secciones.forEach(s => observer.observe(s));
})();

/* ============================================================
   DROPDOWN DE PERFIL
   ============================================================ */
const navProfile      = document.getElementById('navProfile');
const profileDropdown = document.getElementById('profileDropdown');

if (navProfile && profileDropdown) {
  navProfile.addEventListener('click', e => {
    e.stopPropagation();
    const abierto = !profileDropdown.hidden;
    profileDropdown.hidden = abierto;
    navProfile.classList.toggle('open', !abierto);
  });

  document.addEventListener('click', () => {
    profileDropdown.hidden = true;
    navProfile.classList.remove('open');
  });

  profileDropdown.addEventListener('click', e => e.stopPropagation());
}

/* ============================================================
   LOGOUT
   ============================================================ */
const btnLogout = document.getElementById('btnLogout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
  });
}

/* ============================================================
   PANEL DE NOTIFICACIONES / VIDEOS
   ============================================================ */
const btnNotif       = document.getElementById('btnNotif');
const notifPanel     = document.getElementById('notifPanel');
const closeNotifPanel = document.getElementById('closeNotifPanel');

if (btnNotif && notifPanel) {
  btnNotif.addEventListener('click', e => {
    e.stopPropagation();
    notifPanel.hidden = !notifPanel.hidden;
  });

  if (closeNotifPanel) {
    closeNotifPanel.addEventListener('click', () => {
      notifPanel.hidden = true;
    });
  }

  document.addEventListener('click', e => {
    if (!notifPanel.contains(e.target) && e.target !== btnNotif) {
      notifPanel.hidden = true;
    }
  });
}

/* ============================================================
   MODAL DE VIDEO
   ============================================================ */
const videoModal      = document.getElementById('videoModal');
const videoPlayer     = document.getElementById('videoPlayer');
const closeVideo      = document.getElementById('closeVideo');
const closeVideoModal = document.getElementById('closeVideoModal');

/* Abrir video al hacer click en "Ver" */
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn-ver-video');
  if (!btn) return;

  const src = btn.dataset.video;
  if (!src || !videoModal || !videoPlayer) return;

  videoPlayer.src = src;
  videoModal.hidden = false;
  document.body.style.overflow = 'hidden';
  videoPlayer.play().catch(() => {}); /* autoplay puede bloquearse */

  /* Cerrar panel de notificaciones */
  if (notifPanel) notifPanel.hidden = true;
});

function cerrarVideo() {
  if (!videoModal || !videoPlayer) return;
  videoModal.hidden = true;
  videoPlayer.pause();
  videoPlayer.src   = '';
  document.body.style.overflow = '';
}

if (closeVideo)      closeVideo.addEventListener('click', cerrarVideo);
if (closeVideoModal) closeVideoModal.addEventListener('click', cerrarVideo);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarVideo();
});

/* ============================================================
   ENCUESTAS — sistema de estrellas
   ============================================================ */
document.querySelectorAll('.encuesta-stars').forEach(grupo => {
  const estrellas = grupo.querySelectorAll('.star-btn');

  estrellas.forEach((star, idx) => {
    /* Hover: iluminar hasta la estrella */
    star.addEventListener('mouseenter', () => {
      estrellas.forEach((s, i) => s.classList.toggle('active', i <= idx));
    });

    /* Click: fijar valor */
    star.addEventListener('click', () => {
      grupo.dataset.valor = star.dataset.val;
      estrellas.forEach((s, i) => {
        s.classList.toggle('active', i <= idx);
        s.dataset.fijo = i <= idx ? 'true' : 'false';
      });
    });
  });

  /* Al salir del grupo, mantener las fijas */
  grupo.addEventListener('mouseleave', () => {
    const valorFijo = parseInt(grupo.dataset.valor || '0');
    estrellas.forEach((s, i) => s.classList.toggle('active', i < valorFijo));
  });
});

/* ============================================================
   CONTADOR DE CARACTERES EN TEXTAREAS
   ============================================================ */
document.querySelectorAll('textarea[maxlength]').forEach(textarea => {
  /* Buscar el span más cercano con id que contenga "CharCount" */
  const contenedor = textarea.closest('.idea-form-salon, .encuesta-pregunta');
  if (!contenedor) return;
  const contador = contenedor.querySelector('[id*="CharCount"]') ||
                   contenedor.querySelector('.idea-char-count span');
  if (!contador) return;

  const max = parseInt(textarea.maxLength);
  textarea.addEventListener('input', () => {
    const len = textarea.value.length;
    contador.textContent = len;
    if (contador.parentElement) {
      contador.parentElement.style.color = len > max * 0.85 ? 'var(--naranja)' : '';
      if (len >= max) contador.parentElement.style.color = 'var(--rojo)';
    }
  });
});

/* ============================================================
   BOTÓN LIKE — toggle con contador
   ============================================================ */
document.querySelectorAll('.btn-like').forEach(btn => {
  btn.addEventListener('click', () => {
    const span   = btn.querySelector('span');
    const liked  = btn.classList.toggle('liked');
    const actual = parseInt(span.textContent) || 0;
    span.textContent = liked ? actual + 1 : actual - 1;

    /* Animación de rebote */
    btn.style.transform = 'scale(1.25)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  });
});

/* ============================================================
   ENVÍO DE ENCUESTA — confirmación
   ============================================================ */
document.querySelectorAll('[id^="btnEnviarEncuesta"]').forEach(btn => {
  btn.addEventListener('click', () => {
    /* Validar que haya respondido al menos una pregunta */
    const form    = btn.closest('section') || btn.closest('.encuesta-form-card');
    const grupos  = form ? form.querySelectorAll('.encuesta-stars') : [];
    const respondidas = [...grupos].filter(g => g.dataset.valor);

    if (grupos.length > 0 && respondidas.length === 0) {
      mostrarToast('Por favor responde al menos una pregunta antes de enviar.', 'advertencia');
      return;
    }

    /* Deshabilitar y confirmar */
    btn.disabled = true;
    btn.textContent = '✅ Respuesta enviada — ¡Gracias!';
    btn.style.background = 'linear-gradient(135deg, var(--verde-base), var(--verde-oscuro))';
    mostrarToast('Tu respuesta fue registrada. ¡Gracias por participar!', 'exito');
  });
});

/* ============================================================
   ENVÍO DE IDEAS — validación y feedback
   ============================================================ */
document.querySelectorAll('[id^="btnSubmitIdea"]').forEach(btn => {
  btn.addEventListener('click', () => {
    /* Buscar el textarea más cercano */
    const contenedor = btn.closest('.idea-form-salon');
    const textarea   = contenedor ? contenedor.querySelector('textarea') : null;
    if (!textarea) return;

    const texto = textarea.value.trim();
    if (texto.length < 10) {
      mostrarToast('Tu idea debe tener al menos 10 caracteres.', 'advertencia');
      textarea.focus();
      return;
    }

    /* Agregar idea a la lista local */
    agregarIdeaLocal(texto);
    textarea.value = '';

    /* Resetear contador */
    const contador = contenedor.querySelector('[id*="CharCount"]');
    if (contador) contador.textContent = '0';

    mostrarToast('¡Propuesta enviada! La jefatura la revisará pronto. 💡', 'exito');
  });
});

function agregarIdeaLocal(texto) {
  const lista = document.querySelector('.ideas-lista');
  if (!lista) return;

  const item = document.createElement('div');
  item.className = 'idea-item idea-item--pendiente';
  item.style.animation = 'card-in 0.4s ease both';
  item.innerHTML = `
    <div class="idea-item__header">
      <span class="idea-status status--pendiente">⏳ Pendiente</span>
      <span class="idea-fecha">Ahora mismo</span>
    </div>
    <p class="idea-texto">"${escapeHTML(texto)}"</p>
  `;
  lista.prepend(item);
}

/* ============================================================
   TOAST / NOTIFICACIÓN GLOBAL
   ============================================================ */
function mostrarToast(mensaje, tipo = 'info') {
  /* Eliminar toast previo si existe */
  document.querySelector('.papeos-toast')?.remove();

  const iconos = { exito: '✅', advertencia: '⚠️', error: '❌', info: 'ℹ️' };
  const colores = {
    exito:       'var(--verde-base)',
    advertencia: 'var(--naranja)',
    error:       'var(--rojo)',
    info:        '#1565C0',
  };

  const toast = document.createElement('div');
  toast.className = 'papeos-toast';
  toast.innerHTML = `<span>${iconos[tipo] || 'ℹ️'}</span><span>${mensaje}</span>`;

  Object.assign(toast.style, {
    position:      'fixed',
    bottom:        '24px',
    left:          '50%',
    transform:     'translateX(-50%) translateY(80px)',
    background:    colores[tipo] || colores.info,
    color:         '#fff',
    padding:       '12px 24px',
    borderRadius:  '50px',
    fontFamily:    'var(--font-body)',
    fontSize:      '0.88rem',
    fontWeight:    '600',
    boxShadow:     'var(--shadow-lg)',
    zIndex:        '99999',
    display:       'flex',
    alignItems:    'center',
    gap:           '8px',
    whiteSpace:    'nowrap',
    maxWidth:      '90vw',
    transition:    'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease',
    opacity:       '0',
  });

  document.body.appendChild(toast);

  /* Animación entrada */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity   = '1';
    });
  });

  /* Auto-cerrar */
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity   = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

/* ── Exponer globalmente para uso en otros JS ── */
window.mostrarToast = mostrarToast;

/* ============================================================
   HELPER: escape de HTML para contenido de usuario
   ============================================================ */
function escapeHTML(str) {
  return str
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

window.escapeHTML = escapeHTML;

/* ============================================================
   ANIMACIÓN DE ENTRADA DE SECCIONES (IntersectionObserver)
   ============================================================ */
(function animarEntrada() {
  const targets = document.querySelectorAll(
    '.comunicado-card, .reconoc-card, .idea-item, .kpi-card, .equipo-card, .trago-card, .menu-categoria, .pedido-card, .encuesta-resultado-card'
  );

  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
})();

console.info(`%cPapeo's Intranet · Sesión: ${SESSION.nombre} (${SESSION.area})`, 'color:#2E7D32;font-weight:bold;font-size:13px;');
