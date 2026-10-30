/**
 * Login Page Logic with GSAP entrance and role-based redirection
 */

document.addEventListener("DOMContentLoaded", () => {
  // GSAP Entrance
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

  const roleInputs = document.querySelectorAll('input[name="auth-role"]');
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

  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const errorContainer = document.getElementById("auth-error-msg");
  const submitBtn = document.getElementById("login-submit-btn");

  if (!loginForm) return;

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hideError();

    const selectedRole = document.querySelector('input[name="auth-role"]:checked')?.value || "client";
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validations
    if (!email) {
      showError("Please enter your registered email or pharmacy ID.");
      emailInput.focus();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Allow either email or alphanumeric ID for demo
    if (email.includes("@") && !emailRegex.test(email)) {
      showError("Please enter a valid email address format.");
      emailInput.focus();
      return;
    }

    if (!password) {
      showError("Please provide your account password.");
      passwordInput.focus();
      return;
    }

    if (password.length < 4) {
      showError("Password must be at least 4 characters.");
      passwordInput.focus();
      return;
    }

    // Persist authenticated session in LocalStorage
    const sessionUser = {
      name: email.split("@")[0] || "Aravind Kumar",
      email: email,
      role: selectedRole,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem("pharmacy_current_user", JSON.stringify(sessionUser));

    if (selectedRole === "admin") {
      window.location.href = "AdminDashboard.html";
    } else {
      window.location.href = "ClientDashboard.html";
    }
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
