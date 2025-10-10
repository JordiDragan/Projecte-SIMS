document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const form = document.getElementById('cardForm');
  const cardNumber = document.getElementById('cardNumber');
  const expiry = document.getElementById('expiry');
  const cvv = document.getElementById('cvv');
  const name = document.getElementById('name');
  const submitBtn = form.querySelector('button[type="submit"]');

  // --- Función para crear contenedor de error ---
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

  ensureErrorEl(cardNumber);
  ensureErrorEl(expiry);
  ensureErrorEl(cvv);
  ensureErrorEl(name);

  // --- Validaciones ---
  function isValidCardNumber(value) {
    return /^\d{16}$/.test(value.replace(/\s/g, ''));
  }

  function isValidExpiry(value) {
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;
    const [month, year] = value.split('/').map(Number);
    if (month < 1 || month > 12) return false;
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    return year > currentYear || (year === currentYear && month >= currentMonth);
  }

  function isValidCVV(value) {
    return /^\d{3,4}$/.test(value);
  }

  function isValidName(value) {
    return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(value.trim());
  }

  // --- Validadores individuales ---
  function validateCardNumber() {
    const value = cardNumber.value.replace(/\s/g, '');
    const err = document.getElementById('cardNumber-error');
    if (!value) {
      cardNumber.setAttribute('aria-invalid', 'true');
      err.textContent = 'Card number is required.';
      return false;
    }
    if (!isValidCardNumber(value)) {
      err.textContent = 'Card number must be 16 digits.';
      cardNumber.setAttribute('aria-invalid', 'true');
      return false;
    }
    err.textContent = '';
    cardNumber.removeAttribute('aria-invalid');
    return true;
  }

  function validateExpiry() {
    const value = expiry.value;
    const err = document.getElementById('expiry-error');
    if (!value) {
      expiry.setAttribute('aria-invalid', 'true');
      err.textContent = 'Expiration is required.';
      return false;
    }
    if (!isValidExpiry(value)) {
      err.textContent = 'Invalid expiration date.';
      expiry.setAttribute('aria-invalid', 'true');
      return false;
    }
    err.textContent = '';
    expiry.removeAttribute('aria-invalid');
    return true;
  }

  function validateCVV() {
    const value = cvv.value;
    const err = document.getElementById('cvv-error');
    if (!value) {
      cvv.setAttribute('aria-invalid', 'true');
      err.textContent = 'CVV is required.';
      return false;
    }
    if (!isValidCVV(value)) {
      err.textContent = 'CVV must be 3 or 4 digits.';
      cvv.setAttribute('aria-invalid', 'true');
      return false;
    }
    err.textContent = '';
    cvv.removeAttribute('aria-invalid');
    return true;
  }

  function validateNameField() {
    const value = name.value.trim();
    const err = document.getElementById('name-error');
    if (!value) {
      name.setAttribute('aria-invalid', 'true');
      err.textContent = 'Cardholder name is required.';
      return false;
    }
    if (!isValidName(value)) {
      err.textContent = 'Use letters and spaces only.';
      name.setAttribute('aria-invalid', 'true');
      return false;
    }
    err.textContent = '';
    name.removeAttribute('aria-invalid');
    return true;
  }

  // --- Formatear número de tarjeta en grupos de 4 ---
  cardNumber.addEventListener('input', () => {
    let value = cardNumber.value.replace(/\D/g, '');
    value = value.substring(0, 16);
    cardNumber.value = value.replace(/(.{4})/g, '$1 ').trim();
    validateCardNumber();
    updateSubmitState();
  });

  expiry.addEventListener('input', () => {
    let value = expiry.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) value = value.slice(0, 2) + '/' + value.slice(2);
    expiry.value = value;
    validateExpiry();
    updateSubmitState();
  });

  cvv.addEventListener('input', () => {
    validateCVV();
    updateSubmitState();
  });

  name.addEventListener('input', () => {
    validateNameField();
    updateSubmitState();
  });

  // --- Habilitar / deshabilitar submit ---
  function updateSubmitState() {
    const ok = validateCardNumber() && validateExpiry() && validateCVV() && validateNameField();
    submitBtn.disabled = !ok;
    submitBtn.classList.toggle('opacity-50', !ok);
    submitBtn.classList.toggle('cursor-not-allowed', !ok);
  }

  // --- Submit handler ---
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!(validateCardNumber() && validateExpiry() && validateCVV() && validateNameField())) return;

    alert('Card successfully added!');
    form.reset();
    updateSubmitState();
  });

  updateSubmitState();
});
