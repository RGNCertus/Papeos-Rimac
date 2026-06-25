/* ============================================================
   PAPEO'S RÍMAC — login.js
   Autenticación, validación y redirección por área
   ============================================================ */

'use strict';

/* ── CREDENCIALES (frontend-only, sin backend) ── */
const USUARIOS = {
  'PapeosJefa2026':     { password: 'JefaPapeos1',    ruta: 'dashboard-jefa.html',     nombre: 'Sra. Katty',    area: 'Jefatura' },
  'PapeosSalon2026':    { password: 'SalonMesa1',     ruta: 'dashboard-salon.html',    nombre: 'Equipo Salón',   area: 'Salón' },
  'PapeosBar2026':      { password: 'BarTrago1',      ruta: 'dashboard-bar.html',      nombre: 'Equipo Bar',     area: 'Bar' },
  'PapeosCocina2026':   { password: 'CocinaFuego1',   ruta: 'dashboard-cocina.html',   nombre: 'Equipo Cocina',  area: 'Cocina' },
  'PapeosDelivery2026': { password: 'DeliveryMoto1',  ruta: 'dashboard-delivery.html', nombre: 'Equipo Delivery',area: 'Delivery' },
};

const MAX_INTENTOS   = 3;
const BLOQUEO_SEG    = 30;

/* ── ESTADO ── */
let intentosFallidos = 0;
let bloqueado        = false;
let timerInterval    = null;

/* ── ELEMENTOS ── */
const inputUser     = document.getElementById('username');
const inputPass     = document.getElementById('password');
const btnLogin      = document.getElementById('btnLogin');
const btnTogglePwd  = document.getElementById('togglePwd');
const loginError    = document.getElementById('loginError');
const loginBlocked  = document.getElementById('loginBlocked');
const loginAttempts = document.getElementById('loginAttempts');
const attemptsCount = document.getElementById('attemptsCount');
const countdownEl   = document.getElementById('countdownTimer');
const btnCapacitacion = document.getElementById('btnCapacitacion');

btnCapacitacion.addEventListener('click', () => {
  window.location.href = 'capacitacion.html';
});

/* ============================================================
   MOSTRAR / OCULTAR CONTRASEÑA
   ============================================================ */
btnTogglePwd.addEventListener('click', () => {
  const esPassword = inputPass.type === 'password';
  inputPass.type   = esPassword ? 'text' : 'password';
  btnTogglePwd.textContent = esPassword ? '🙈' : '👁️';
});

/* ============================================================
   LIMPIAR ERRORES AL ESCRIBIR
   ============================================================ */
[inputUser, inputPass].forEach(input => {
  input.addEventListener('input', () => {
    ocultarError();
    input.classList.remove('error');
  });
});

/* ============================================================
   LOGIN — tecla Enter
   ============================================================ */
[inputUser, inputPass].forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !bloqueado) intentarLogin();
  });
});

/* ============================================================
   LOGIN — botón
   ============================================================ */
btnLogin.addEventListener('click', () => {
  if (!bloqueado) intentarLogin();
});

/* ============================================================
   LÓGICA PRINCIPAL DE LOGIN
   ============================================================ */
function intentarLogin() {
  const usuario    = inputUser.value.trim();
  const contrasena = inputPass.value;

  /* Validación de campos vacíos */
  if (!usuario || !contrasena) {
    mostrarError('Por favor ingresa tu usuario y contraseña.');
    if (!usuario) inputUser.classList.add('error');
    if (!contrasena) inputPass.classList.add('error');
    return;
  }

  /* Estado de carga */
  btnLogin.classList.add('loading');
  btnLogin.disabled = true;

  /* Simular latencia mínima de red (UX) */
  setTimeout(() => {
    const cuenta = USUARIOS[usuario];

    if (cuenta && cuenta.password === contrasena) {
      /* ── LOGIN EXITOSO ── */
      loginExitoso(usuario, cuenta);
    } else {
      /* ── LOGIN FALLIDO ── */
      btnLogin.classList.remove('loading');
      btnLogin.disabled = false;
      loginFallido(usuario);
    }
  }, 600);
}

/* ============================================================
   LOGIN EXITOSO
   ============================================================ */
function loginExitoso(usuario, cuenta) {
  /* Guardar sesión en sessionStorage */
  sessionStorage.setItem('papeos_usuario',  usuario);
  sessionStorage.setItem('papeos_nombre',   cuenta.nombre);
  sessionStorage.setItem('papeos_area',     cuenta.area);
  sessionStorage.setItem('papeos_logueado', 'true');

  /* Animación de éxito en el botón */
  btnLogin.style.background = 'linear-gradient(135deg, #2E7D32, #1B5E20)';
  btnLogin.querySelector('.btn-login__text').textContent = '¡Bienvenido/a!';
  btnLogin.querySelector('.btn-login__arrow').textContent = '✓';

  /* Quitar errores */
  ocultarError();
  inputUser.classList.remove('error');
  inputPass.classList.remove('error');

  /* Redirigir luego de breve pausa */
  setTimeout(() => {
    window.location.href = cuenta.ruta;
  }, 800);
}

/* ============================================================
   LOGIN FALLIDO
   ============================================================ */
function loginFallido(usuario) {
  intentosFallidos++;

  /* Sacudir los campos */
  inputUser.classList.add('error');
  inputPass.classList.add('error');

  /* Limpiar contraseña */
  inputPass.value = '';
  inputPass.focus();

  const restantes = MAX_INTENTOS - intentosFallidos;

  if (intentosFallidos >= MAX_INTENTOS) {
    /* Activar bloqueo */
    iniciarBloqueo();
  } else {
    /* Mostrar error con intentos restantes */
    mostrarError(`Usuario o contraseña incorrectos. Te quedan <strong>${restantes}</strong> intento${restantes === 1 ? '' : 's'}.`);
    mostrarIntentos(restantes);
  }
}

/* ============================================================
   BLOQUEO TEMPORAL
   ============================================================ */
function iniciarBloqueo() {
  bloqueado = true;
  let segundos = BLOQUEO_SEG;

  ocultarError();
  loginBlocked.hidden = false;
  loginAttempts.hidden = true;
  countdownEl.textContent = segundos;

  btnLogin.disabled = true;
  btnLogin.style.opacity = '0.5';
  inputUser.disabled = true;
  inputPass.disabled = true;

  timerInterval = setInterval(() => {
    segundos--;
    countdownEl.textContent = segundos;

    if (segundos <= 0) {
      desbloquear();
    }
  }, 1000);
}

function desbloquear() {
  clearInterval(timerInterval);
  bloqueado         = false;
  intentosFallidos  = 0;

  loginBlocked.hidden  = true;
  loginAttempts.hidden = true;

  btnLogin.disabled    = false;
  btnLogin.style.opacity = '';
  inputUser.disabled   = false;
  inputPass.disabled   = false;

  inputUser.value = '';
  inputPass.value = '';
  inputUser.focus();
}

/* ============================================================
   HELPERS DE UI
   ============================================================ */
function mostrarError(mensaje) {
  loginError.hidden = false;
  loginError.querySelector('.login-error__text').innerHTML = mensaje;
}

function ocultarError() {
  loginError.hidden  = true;
  loginBlocked.hidden = true;
}

function mostrarIntentos(restantes) {
  loginAttempts.hidden  = false;
  attemptsCount.textContent = restantes;
}

/* ============================================================
   REDIRIGIR SI YA ESTÁ LOGUEADO
   ============================================================ */
(function verificarSesionPrevia() {
  if (sessionStorage.getItem('papeos_logueado') === 'true') {
    const usuario = sessionStorage.getItem('papeos_usuario');
    const cuenta  = USUARIOS[usuario];
    if (cuenta) window.location.href = cuenta.ruta;
  }
})();

/* ── Focus inicial ── */
inputUser.focus();
