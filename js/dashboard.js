/**
 * Shared Dashboard Utilities (Admin & Client)
 */

document.addEventListener("DOMContentLoaded", () => {
  setupDashboardSidebar();
  setupSessionUser();
  setupLogout();
});

function setupDashboardSidebar() {
  const toggleBtn = document.getElementById("sidebar-toggle-btn");
  const sidebar = document.querySelector(".dashboard-sidebar");
  const overlay = document.getElementById("dashboard-overlay");
  const closeBtn = document.getElementById("sidebar-close-btn");

  if (!toggleBtn || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add("active");
    if (overlay) overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("active");
    if (overlay) overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  toggleBtn.addEventListener("click", openSidebar);
  if (closeBtn) closeBtn.addEventListener("click", closeSidebar);
  if (overlay) overlay.addEventListener("click", closeSidebar);

  // Submenu toggles (for backwards compatibility if any exist)
  const menuHeaders = document.querySelectorAll(".menu-header-toggle");
  menuHeaders.forEach(header => {
    header.addEventListener("click", (e) => {
      e.preventDefault();
      const parent = header.closest(".nav-group");
      if (parent) {
        parent.classList.toggle("open");
        const icon = header.querySelector(".group-arrow");
        if (icon) {
          icon.style.transform = parent.classList.contains("open") ? "rotate(180deg)" : "rotate(0deg)";
        }
      }
    });
  });

  // Active state for flat sidebar nav links
  const navLinks = document.querySelectorAll(".sidebar-nav-container .sidebar-nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
      if (window.innerWidth <= 992) {
        closeSidebar();
      }
    });
  });
}

function setupSessionUser() {
  const sessionUserStr = localStorage.getItem("pharmacy_current_user");
  let user = null;
  if (sessionUserStr) {
    try {
      user = JSON.parse(sessionUserStr);
    } catch (e) {}
  }

  // Determine user email from login session
  const displayEmail = (user && user.email)
    ? user.email
    : (window.location.pathname.toLowerCase().includes("admin") ? "admin@dispensary.com" : "user@example.com");

  // Determine role selected in login page
  const rawRole = (user && user.role)
    ? user.role
    : (window.location.pathname.toLowerCase().includes("admin") ? "admin" : "user");
  const displayRole = rawRole.toLowerCase() === "admin" ? "Admin" : "User";

  // Display entered email ID in the user profile area
  const nameEls = document.querySelectorAll(".session-user-name");
  nameEls.forEach(el => el.textContent = displayEmail);

  // Display selected role in the marked badge area
  const roleEls = document.querySelectorAll(".user-role-label");
  roleEls.forEach(el => el.textContent = displayRole);

  // Display initial in user avatar circle
  const avatarEls = document.querySelectorAll(".session-user-avatar-text");
  avatarEls.forEach(el => {
    const initial = (displayEmail || "U").charAt(0).toUpperCase();
    el.textContent = initial;
  });
}

function setupLogout() {
  const logoutBtns = document.querySelectorAll(".btn-logout-action");
  logoutBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("pharmacy_current_user");
      if (window.gsap) {
        gsap.to(".dashboard-layout", {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            window.location.href = "Login.html";
          }
        });
      } else {
        window.location.href = "Login.html";
      }
    });
  });
}
