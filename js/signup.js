/**
 * Signup Page Logic with complete field validation and success animation
 */

document.addEventListener("DOMContentLoaded", () => {
  if (window.gsap) {
    gsap.from(".auth-card", {
      opacity: 0,
      y: 35,
      duration: 0.8,
      ease: "power3.out"
    });
    gsap.from(".auth-back-link", {
      opacity: 0,
      x: -20,
      duration: 0.6,
      delay: 0.2
    });
  }

  const roleTabs = document.querySelectorAll(".role-toggle-btn");
  roleTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      roleTabs.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const targetRole = btn.getAttribute("data-role");
      const radio = document.querySelector(`input[name="auth-role"][value="${targetRole}"]`);
      if (radio) radio.checked = true;
    });
  });

  const signupForm = document.getElementById("signup-form");
  const nameInput = document.getElementById("signup-name");
  const emailInput = document.getElementById("signup-email");
  const passwordInput = document.getElementById("signup-password");
  const confirmPasswordInput = document.getElementById("signup-confirm-password");
  const errorContainer = document.getElementById("auth-error-msg");
  const submitBtn = document.getElementById("signup-submit-btn");
  const successModal = document.getElementById("signup-success-modal");

  if (!signupForm) return;

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError();

    const selectedRole = document.querySelector('input[name="auth-role"]:checked')?.value || "client";
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validations
    if (!name) {
      showError("Please enter your full legal name.");
      nameInput.focus();
      return;
    }

    if (name.length < 3) {
      showError("Full name must be at least 3 characters.");
      nameInput.focus();
      return;
    }

    if (!email) {
      showError("Please enter your email address.");
      emailInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Please enter a valid email format.");
      emailInput.focus();
      return;
    }

    if (!password) {
      showError("Please choose a secure password.");
      passwordInput.focus();
      return;
    }

    if (password.length < 6) {
      showError("Password must be at least 6 characters for medical data security.");
      passwordInput.focus();
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match. Please verify.");
      confirmPasswordInput.focus();
      return;
    }

    // Success State
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...`;

    // Save temporary registration in LocalStorage
    const users = JSON.parse(localStorage.getItem("pharmacy_registered_users") || "[]");
    users.push({
      name,
      email,
      role: selectedRole,
      registeredAt: new Date().toISOString()
    });
    localStorage.setItem("pharmacy_registered_users", JSON.stringify(users));

    setTimeout(() => {
      // Trigger animated success modal
      if (successModal) {
        successModal.classList.add("active");
        if (window.gsap) {
          gsap.fromTo(
            successModal.querySelector(".modal-card"),
            { scale: 0.85, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
          );
        }
      }

      setTimeout(() => {
        window.location.href = "Login.html";
      }, 2200);
    }, 800);
  });

  function showError(msg) {
    if (errorContainer) {
      errorContainer.textContent = msg;
      errorContainer.style.display = "block";
      if (window.gsap) {
        gsap.fromTo(errorContainer, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3 });
      }
    }
  }

  function hideError() {
    if (errorContainer) {
      errorContainer.style.display = "none";
    }
  }
});
