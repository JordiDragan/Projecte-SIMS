document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const form = document.getElementById('registerForm') || document.querySelector('form');
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const submitBtn = form.querySelector('button[type="submit"]');


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
  ensureErrorEl(name);
  ensureErrorEl(email);
  ensureErrorEl(password);


  function isValidName(value) {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value.trim());
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }
  function isValidPassword(value) {
    return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}/.test(value.trim());
  }


  function validateName() {
  const value = name.value.trim()
  const err = document.getElementById(`${name.id}-error`);
  if (!value) {
    name.setAttribute('aria-invalid', 'true');
    return false;
  }
  if (!isValidName(value)) {
    err.textContent = 'Invalid name format. Use letters and spaces only.';
    name.setAttribute('aria-invalid', 'true');
    return false;
  }
  err.textContent = '';
  name.removeAttribute('aria-invalid');
  return true;
  }


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
      err.textContent = 'Please choose a strong password with uppercase, lowercase, digits, and special characters.';
      password.setAttribute('aria-invalid', 'true');
      return false;
    };
    err.textContent = '';
    password.removeAttribute('aria-invalid');
    return true;
  }


  // Enable & disable submit button
  function updateSubmitState() {
    const ok = validateName() && validateEmail() && validatePassword();
    submitBtn.disabled = !ok;
    submitBtn.classList.toggle('opacity-50', !ok);
    submitBtn.classList.toggle('cursor-not-allowed', !ok);
  }

  name.addEventListener('input', () => {
    validateName();
    updateSubmitState();
  });

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
      btn.setAttribute('aria-label', isPassword ? 'Hide contraseña' : 'Show contraseña');
      btn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
  })();


// --- Submit handler ---
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nameOK = validateName();
  const emailOk = validateEmail();
  const passOk = validatePassword();

  if (!nameOK || !emailOk || !passOk) {
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  // Send data to processRegister.php
  const userData = {
    name: name.value.trim(),
    email: email.value.trim(),
    password: password.value,
  };

  fetch('/pages/processRegister.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(userData)
  })

  .then(res => res.json())
  .then(data => {
    if (data.success) {
      form.reset();
    } else {
      alert(data.message || 'Error to connect with Database');
    }
  })
  .catch(() => {
    alert('Network error. Try again.');
  });

  updateSubmitState();
});
})