// script.js
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const FORM = document.getElementById('loginForm') || document.querySelector('form');
  const EMAIL = document.getElementById('email');
  const PASSWORD = document.getElementById('password');
  const SUBMIT_BTN = FORM.querySelector('button[type="submit"]');

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

  // Error message containers
  ensureErrorEl(EMAIL);
  ensureErrorEl(PASSWORD);


  // Email regex
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
  function isValidPassword(value) {
    return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}/.test(value.trim());
  }

  // Validations
  function validateEmail() {
    const value = EMAIL.value.trim();
    const err = document.getElementById(`${EMAIL.id}-error`);
    if (!value) {
      EMAIL.setAttribute('aria-invalid', 'true');
      return false;
    }
    if (!isValidEmail(value)) {
      err.textContent = 'Invalid email format.';
      EMAIL.setAttribute('aria-invalid', 'true');
      return false;
    }
    err.textContent = '';
    EMAIL.removeAttribute('aria-invalid');
    return true;
  }

  function validatePassword() {
    const value = PASSWORD.value;
    const err = document.getElementById(`${PASSWORD.id}-error`);
    if (!value) {
      PASSWORD.setAttribute('aria-invalid', 'true');
      return false;
    }
    if (value.length < 8) {
      err.textContent = 'Your password must contain a minimum of 8 characters.';
      PASSWORD.setAttribute('aria-invalid', 'true');
      return false;
    }

    if (!isValidPassword(value)) { 
      err.textContent = 'The password must be complex.';
      PASSWORD.setAttribute('aria-invalid', 'true');
      return false;
    };
    err.textContent = '';
    PASSWORD.removeAttribute('aria-invalid');
    return true;
  }

  // Enable & disable submit button
  function updateSubmitState() {
    const ok = validateEmail() && validatePassword();
    SUBMIT_BTN.disabled = !ok;
    SUBMIT_BTN.classList.toggle('opacity-50', !ok);
    SUBMIT_BTN.classList.toggle('cursor-not-allowed', !ok);
  }

  EMAIL.addEventListener('input', () => {
    validateEmail();
    updateSubmitState();
  });

  PASSWORD.addEventListener('input', () => {
    validatePassword();
    updateSubmitState();
  });

  // Show & hide password
  (function addPasswordToggle() {
    const wrapper = PASSWORD.closest('.relative') || PASSWORD.parentElement;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Mostrar contraseña');
    btn.className = 'absolute inset-y-0 right-0 pr-3 flex items-center';
    btn.innerHTML = '<i class="fas fa-eye"></i>';
    wrapper.appendChild(btn);

    btn.addEventListener('click', () => {
      const isPassword = PASSWORD.type === 'password';
      PASSWORD.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
      btn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  })();


  // --- Submit handler ---
  FORM.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailOk = validateEmail();
    const passOk = validatePassword();

    if (!emailOk || !passOk) {
      // foco al primer campo inválido para accesibilidad
      const firstInvalid = FORM.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Mostrar estado de carga en el botón
    const originalHTML = SUBMIT_BTN.innerHTML;
    SUBMIT_BTN.disabled = true;
    SUBMIT_BTN.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Entrando...';

    try {
      const res = await fetch('/pages/processLogin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL.value.trim(), password: PASSWORD.value })
      });

      const data = await res.json();
      if (data.success) {
        window.location.href = '/';
      } else {
        let general = document.getElementById('login-general-error');
        if (!general) {
          general = document.createElement('p');
          general.id = 'login-general-error';
          general.className = 'text-red-600 text-sm mt-4';
          general.setAttribute('role', 'alert');
          FORM.appendChild(general);
        }
        general.textContent = data.message || 'Credenciales incorrectas.';
        SUBMIT_BTN.disabled = false;
        SUBMIT_BTN.innerHTML = originalHTML;
      }
    } catch (err) {
      console.error(err);
      alert('Error de red. Intenta más tarde.');
      SUBMIT_BTN.disabled = false;
      SUBMIT_BTN.innerHTML = originalHTML;
    }
  });

  updateSubmitState();
});