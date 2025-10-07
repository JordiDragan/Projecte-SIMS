tailwind.config = {
    theme: {
        extend: {
            colors: {
                'primary': '#0D6344',
                'primary-light': '#CAF0D8',
                'accent': '#7E3FBC',
                'accent-light': '#CB97FF'
            },
            fontFamily: {
                'montserrat': ['Montserrat', 'sans-serif']
            }
        }
    }
}
// script.js
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const form = document.getElementById('loginForm') || document.querySelector('form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const submitBtn = form.querySelector('button[type="submit"]');

  // --- Helpers ---
  function ensureErrorEl(input) {
    const wrapper = input.closest('.relative') || input.parentElement;
    const id = `${input.id}-error`;
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('p');
      el.id = id;
      el.className = 'text-red-600 text-sm mt-1';
      el.setAttribute('role', 'alert');
      el.setAttribute('aria-live', 'assertive');
      wrapper.insertAdjacentElement('afterend', el);
    }
    input.setAttribute('aria-describedby', id);
    return el;
  }

  // Creación/asegurado de contenedores de error
  ensureErrorEl(email);
  ensureErrorEl(password);

  // Email regex simple y robusta para uso típico
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
  function isValidPassword(value) {
    return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}/.test(value.trim());
  }
  // --- Validadores ---
  function validateEmail() {
    const value = email.value.trim();
    const err = document.getElementById(`${email.id}-error`);
    if (!value) {
      email.setAttribute('aria-invalid', 'true');
      return false;
    }
    if (!isValidEmail(value)) {
      err.textContent = 'Formato de email no válido.';
      email.setAttribute('aria-invalid', 'true');
      return false;
    }
    err.textContent = '';
    email.removeAttribute('aria-invalid');
    return true;
  }

  function validatePassword() {
    const value = password.value;
    const err = document.getElementById(`${password.id}-error`);
    if (!value) {
      password.setAttribute('aria-invalid', 'true');
      return false;
    }
    if (value.length < 8) {
      err.textContent = 'La contraseña debe tener al menos 8 caracteres.';
      password.setAttribute('aria-invalid', 'true');
      return false;
    }

    if (!isValidPassword(value)) { 
      err.textContent = 'La contraseña debe ser compleja';
      password.setAttribute('aria-invalid', 'true');
      return false;
    };
    err.textContent = '';
    password.removeAttribute('aria-invalid');
    return true;
  }

  // Habilita/deshabilita el botón submit y pinta feedback visual
  function updateSubmitState() {
    const ok = validateEmail() && validatePassword();
    submitBtn.disabled = !ok;
    submitBtn.classList.toggle('opacity-50', !ok);
    submitBtn.classList.toggle('cursor-not-allowed', !ok);
  }

  // --- Eventos de campo (validación en tiempo real) ---
  email.addEventListener('input', () => {
    validateEmail();
    updateSubmitState();
  });

  password.addEventListener('input', () => {
    validatePassword();
    updateSubmitState();
  });

  // --- Toggle mostrar/ocultar contraseña (se añade dinámicamente) ---
  (function addPasswordToggle() {
    const wrapper = password.closest('.relative') || password.parentElement;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Mostrar contraseña');
    btn.className = 'absolute inset-y-0 right-0 pr-3 flex items-center';
    btn.innerHTML = '<i class="fas fa-eye"></i>';
    // aseguramos posicionamiento: wrapper debe ser relativo (ya lo es en tu HTML)
    wrapper.appendChild(btn);

    btn.addEventListener('click', () => {
      const isPassword = password.type === 'password';
      password.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
      btn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  })();

  // --- Submit handler ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailOk = validateEmail();
    const passOk = validatePassword();

    if (!emailOk || !passOk) {
      // foco al primer campo inválido para accesibilidad
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Mostrar estado de carga en el botón
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Entrando...';

    try {
      // Ejemplo de envío: sustituye la URL por tu endpoint real
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value.trim(), password: password.value })
      });

      if (!res.ok) {
        // Mostrar error general (crea un contenedor si hace falta)
        let general = document.getElementById('login-general-error');
        if (!general) {
          general = document.createElement('p');
          general.id = 'login-general-error';
          general.className = 'text-red-600 text-sm mt-4';
          general.setAttribute('role', 'alert');
          form.appendChild(general);
        }
        const data = await res.json().catch(() => ({}));
        general.textContent = data.message || 'Credenciales incorrectas.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        return;
      }

      // Si todo ok, redirigir o manejar sesión
      window.location.href = '/dashboard'; // cambia según tu app
    } catch (err) {
      console.error(err);
      alert('Error de red. Intenta más tarde.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  });

  // Inicializamos el estado del botón
  updateSubmitState();
});
