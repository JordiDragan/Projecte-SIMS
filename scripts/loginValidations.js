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

  // Error message containers
  ensureErrorEl(email);
  ensureErrorEl(password);


  // Email regex
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
  function isValidPassword(value) {
    return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}/.test(value.trim());
  }

  // Validations
  function validateEmail() {
    const value = email.value.trim();
    const err = document.getElementById(`${email.id}-error`);
    if (!value) {
      email.setAttribute('aria-invalid', 'true');
      return false;
    }
    if (!isValidEmail(value)) {
      err.textContent = 'Invalid email format.';
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
      err.textContent = 'Your password must contain a minimum of 8 characters.';
      password.setAttribute('aria-invalid', 'true');
      return false;
    }

    if (!isValidPassword(value)) { 
      err.textContent = 'The password must be complex.';
      password.setAttribute('aria-invalid', 'true');
      return false;
    };
    err.textContent = '';
    password.removeAttribute('aria-invalid');
    return true;
  }

  // Enable & disable submit button
  function updateSubmitState() {
    const ok = validateEmail() && validatePassword();
    submitBtn.disabled = !ok;
    submitBtn.classList.toggle('opacity-50', !ok);
    submitBtn.classList.toggle('cursor-not-allowed', !ok);
  }

  email.addEventListener('input', () => {
    validateEmail();
    updateSubmitState();
  });

  password.addEventListener('input', () => {
    validatePassword();
    updateSubmitState();
  });

  // Show & hide password
  (function addPasswordToggle() {
    const wrapper = password.closest('.relative') || password.parentElement;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Mostrar contraseña');
    btn.className = 'absolute inset-y-0 right-0 pr-3 flex items-center';
    btn.innerHTML = '<i class="fas fa-eye"></i>';
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
      const res = await fetch('/pages/processLogin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value.trim(), password: password.value })
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
          form.appendChild(general);
        }
        general.textContent = data.message || 'Credenciales incorrectas.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
      }
    } catch (err) {
      console.error(err);
      alert('Error de red. Intenta más tarde.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  });

  updateSubmitState();
});