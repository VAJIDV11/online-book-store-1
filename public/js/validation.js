// Client-Side Form Validation Scripts

document.addEventListener('DOMContentLoaded', () => {
  // 1. Registration Form Validation
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    const nameInput = document.getElementById('full_name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm_password');
    const passwordStrengthBar = document.getElementById('password-strength-bar');
    const passwordStrengthText = document.getElementById('password-strength-text');

    // Real-time password strength check
    if (passwordInput && passwordStrengthBar && passwordStrengthText) {
      passwordInput.addEventListener('input', () => {
        const val = passwordInput.value;
        let score = 0;

        if (val.length >= 8) score++;
        if (/[a-z]/.test(val)) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/\d/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        if (val.length === 0) {
          passwordStrengthBar.style.width = '0%';
          passwordStrengthBar.className = 'h-1.5 rounded-full transition-all duration-300 bg-slate-200';
          passwordStrengthText.textContent = '';
        } else if (score <= 2) {
          passwordStrengthBar.style.width = '33%';
          passwordStrengthBar.className = 'h-1.5 rounded-full transition-all duration-300 bg-rose-500';
          passwordStrengthText.textContent = 'Weak (add uppercase, number & symbol)';
          passwordStrengthText.className = 'text-xs text-rose-500 font-medium';
        } else if (score <= 4) {
          passwordStrengthBar.style.width = '66%';
          passwordStrengthBar.className = 'h-1.5 rounded-full transition-all duration-300 bg-amber-500';
          passwordStrengthText.textContent = 'Moderate';
          passwordStrengthText.className = 'text-xs text-amber-500 font-medium';
        } else {
          passwordStrengthBar.style.width = '100%';
          passwordStrengthBar.className = 'h-1.5 rounded-full transition-all duration-300 bg-emerald-500';
          passwordStrengthText.textContent = 'Strong Password';
          passwordStrengthText.className = 'text-xs text-emerald-500 font-medium';
        }
      });
    }

    // Matching password check
    if (confirmInput && passwordInput) {
      const checkMatch = () => {
        const matchError = document.getElementById('confirm-error');
        if (confirmInput.value && confirmInput.value !== passwordInput.value) {
          if (matchError) matchError.classList.remove('hidden');
          confirmInput.classList.add('border-rose-500');
        } else {
          if (matchError) matchError.classList.add('hidden');
          confirmInput.classList.remove('border-rose-500');
        }
      };

      confirmInput.addEventListener('input', checkMatch);
      passwordInput.addEventListener('input', checkMatch);
    }
  }

  // 2. Quantity Selector in Product Details & Cart
  const qtyDecreaseButtons = document.querySelectorAll('.qty-decrement');
  const qtyIncreaseButtons = document.querySelectorAll('.qty-increment');

  qtyDecreaseButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input[type="number"]');
      if (input) {
        const min = parseInt(input.min, 10) || 1;
        const current = parseInt(input.value, 10) || 1;
        if (current > min) {
          input.value = current - 1;
          input.dispatchEvent(new Event('change'));
        }
      }
    });
  });

  qtyIncreaseButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input[type="number"]');
      if (input) {
        const max = parseInt(input.max, 10) || 99;
        const current = parseInt(input.value, 10) || 1;
        if (current < max) {
          input.value = current + 1;
          input.dispatchEvent(new Event('change'));
        }
      }
    });
  });
});
