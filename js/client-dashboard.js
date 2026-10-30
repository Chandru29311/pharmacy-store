/**
 * Client Dashboard Functionality
 * Orders list, Live Order Tracking Progress Bar with GSAP, Wishlist with LocalStorage, Recommended Products, Settings
 */

document.addEventListener("DOMContentLoaded", () => {
  setupClientSidebarNav();
  renderClientOrders();
  animateOrderTracking();
  renderClientWishlist();
  renderClientRecommended();
  renderClientMessages();
  setupClientSettingsTabs();
});

function setupClientSidebarNav() {
  const navLinks = document.querySelectorAll(".sidebar-nav-container .sidebar-nav-link");
  const sections = document.querySelectorAll(".client-dashboard-section");

  function switchSection(targetId) {
    if (!targetId) return;
    const cleanId = targetId.replace("#", "");
    const targetSection = document.getElementById(cleanId);
    if (!targetSection) return;

    // Update nav links active state
    navLinks.forEach(link => {
      const linkTarget = (link.getAttribute("href") || "").replace("#", "") || link.getAttribute("data-target");
      if (linkTarget === cleanId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Update sections with smooth transition
    sections.forEach(sec => {
      if (sec.id === cleanId) {
        sec.classList.add("active-section");
        if (window.gsap) {
          gsap.fromTo(sec, 
            { opacity: 0, y: 15 }, 
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
          );
        }
      } else {
        sec.classList.remove("active-section");
      }
    });

    // Section specific hooks
    if (cleanId === "section-tracking") {
      animateOrderTracking();
    } else if (cleanId === "section-orders") {
      renderClientOrders();
    } else if (cleanId === "section-messages") {
      renderClientMessages();
    }

    // Scroll main view to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Update URL hash without scroll jumps
    if (history.pushState) {
      history.pushState(null, null, "#" + cleanId);
    } else {
      location.hash = "#" + cleanId;
    }
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href") || link.getAttribute("data-target");
      switchSection(href);

      // On mobile, auto close sidebar
      const sidebar = document.querySelector(".dashboard-sidebar");
      const overlay = document.getElementById("dashboard-overlay");
      if (sidebar && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("open");
      }
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "");
    const validIds = ["section-dashboard", "section-orders", "section-tracking", "section-messages", "section-settings"];
    if (validIds.includes(hash)) {
      switchSection(hash);
    }
  });

  // Check initial hash on load
  const initialHash = window.location.hash ? window.location.hash.replace("#", "") : "section-dashboard";
  const validIds = ["section-dashboard", "section-orders", "section-tracking", "section-messages", "section-settings"];
  if (validIds.includes(initialHash)) {
    switchSection(initialHash);
  } else {
    switchSection("section-dashboard");
  }
}


function renderClientOrders() {
  const container = document.getElementById("client-orders-list");
  if (!container) return;

  const orders = window.OrdersManager ? window.OrdersManager.getAll() : [];
  // Aravind Kumar orders
  const clientOrders = orders.filter(o => 
    o.customerName === "Aravind Kumar" || o.orderId === "ORD-1024" || o.orderId === "ORD-1018"
  );

  container.innerHTML = clientOrders.map(order => `
    <div class="client-order-card" data-id="${order.orderId}">
      <img src="${order.image || 'assets/vitamins-01.webp'}" alt="${order.productName}" class="client-order-img">
      <div class="client-order-details">
        <div class="client-order-header">
          <h4 class="client-order-name">${order.productName}</h4>
          <span class="client-order-price">₹${order.price.toLocaleString()}</span>
        </div>
        <p class="client-order-meta">
          <span class="font-mono text-accent">#${order.orderId}</span> • Placed on ${order.date}
        </p>
        <div class="client-order-status-row">
          <span class="status-badge ${order.status === 'Delivered' ? 'status-badge-delivered' : 'status-badge-shipped'}">
            ● ${order.status}
          </span>
          <span class="expected-badge">Expected: ${order.expectedDelivery}</span>
        </div>
      </div>
      <div class="client-order-actions">
        <button class="btn btn-outline-sm" onclick="viewClientOrder('${order.orderId}')">
          <i class="fa-solid fa-eye"></i> VIEW
        </button>
      </div>
    </div>
  `).join("");
}

function viewClientOrder(orderId) {
  window.location.href = "404.html";
}
window.viewClientOrder = viewClientOrder;

function animateOrderTracking() {
  const progressBar = document.querySelector(".tracker-progress-fill");
  if (!progressBar) return;

  // Currently step 4 (Out for Delivery) out of 5 is active (approx 75-80%)
  if (window.gsap) {
    gsap.fromTo(
      progressBar,
      { width: "0%" },
      { width: "75%", duration: 1.4, ease: "power2.out", delay: 0.3 }
    );
    gsap.from(".tracker-step", {
      opacity: 0,
      y: 15,
      stagger: 0.15,
      duration: 0.5,
      ease: "power2.out",
      delay: 0.2
    });
  } else {
    progressBar.style.width = "75%";
  }
}

function renderClientWishlist() {
  const container = document.getElementById("client-wishlist-grid");
  if (!container) return;

  const wishlistIds = window.WishlistManager ? window.WishlistManager.getAll() : ["med-01", "med-02"];
  const products = wishlistIds.map(id => window.InventoryManager?.getById(id)).filter(Boolean);

  if (products.length === 0) {
    container.innerHTML = `
      <div class="empty-state-card col-span-full">
        <i class="fa-regular fa-heart"></i>
        <h5>Your Wishlist is Empty</h5>
        <p>Save vitamins, medicines, and wellness products to track their availability.</p>
        <a href="Shop.html" class="btn btn-gold btn-sm">Explore Shop</a>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(item => `
    <div class="wishlist-item-card" id="wishlist-item-${item.id}">
      <img src="${item.image}" alt="${item.name}" class="wishlist-item-img">
      <div class="wishlist-item-body">
        <span class="wishlist-item-cat">${item.category}</span>
        <h5 class="wishlist-item-title">${item.name}</h5>
        <div class="wishlist-item-price">₹${item.price.toLocaleString()}</div>
        <div class="wishlist-item-actions">
          <a href="ProductDetails.html?id=${item.id}" class="btn btn-outline-sm">VIEW</a>
          <button class="btn btn-text-danger btn-sm" onclick="removeClientWishlist('${item.id}')">REMOVE</button>
        </div>
      </div>
    </div>
  `).join("");
}

function removeClientWishlist(productId) {
  if (window.WishlistManager) {
    window.WishlistManager.toggle(productId);
    const card = document.getElementById(`wishlist-item-${productId}`);
    if (card && window.gsap) {
      gsap.to(card, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        onComplete: () => {
          renderClientWishlist();
        }
      });
    } else {
      renderClientWishlist();
    }
  }
}
window.removeClientWishlist = removeClientWishlist;

function renderClientRecommended() {
  const container = document.getElementById("client-recommended-grid");
  if (!container) return;

  const recommendations = [
    {
      category: "WELLNESS",
      name: "Vitamin C 500mg Zinc Complex",
      price: 499,
      image: "assets/vitamins-01.webp",
      id: "med-01"
    },
    {
      category: "NUTRITION",
      name: "Omega-3 Wild Fish Oil 1000mg",
      price: 899,
      image: "assets/medicine-02.webp",
      id: "med-02"
    },
    {
      category: "PERSONAL CARE",
      name: "Pure Natural Hydrating Cleanser",
      price: 529,
      image: "assets/personal-care-01.webp",
      id: "med-06"
    }
  ];

  container.innerHTML = recommendations.map(item => `
    <div class="recommended-card">
      <span class="rec-category-tag">${item.category}</span>
      <img src="${item.image}" alt="${item.name}" class="rec-thumb">
      <h5 class="rec-title">${item.name}</h5>
      <span class="rec-price">₹${item.price.toLocaleString()}</span>
      <div class="rec-actions">
        <a href="ProductDetails.html?id=${item.id}" class="btn btn-outline-sm">View Details</a>
        <button class="btn btn-gold btn-sm quick-add-btn" data-id="${item.id}">Add</button>
      </div>
    </div>
  `).join("");
}

function renderClientMessages() {
  const container = document.getElementById("client-messages-list");
  if (!container || !window.NotificationManager) return;

  const msgs = window.NotificationManager.getClientMessages();

  container.innerHTML = msgs.map(m => `
    <div class="client-msg-item ${m.unread ? 'unread' : ''}">
      <div class="msg-dot"></div>
      <div class="msg-content">
        <div class="msg-top">
          <h5 class="msg-title">${m.title}</h5>
          <span class="msg-time">${m.time}</span>
        </div>
        <p class="msg-preview">${m.preview}</p>
      </div>
    </div>
  `).join("");
}

function setupClientSettingsTabs() {
  const tabBtns = document.querySelectorAll(".settings-nav-btn");
  const tabPanes = document.querySelectorAll(".settings-tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const pane = document.getElementById(targetId);
      if (pane) pane.classList.add("active");
    });
  });

  const settingsForm = document.getElementById("profile-settings-form");
  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (window.NotificationManager) {
        window.NotificationManager.showToast("Profile information saved successfully.");
      }
    });
  }
}
