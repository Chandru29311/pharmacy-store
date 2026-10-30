/**
 * Admin Dashboard Functionality
 * Dynamic KPI Counters, Orders, Inventory Alerts, Sales Performance SVG Chart, Top Products, Notifications
 */

document.addEventListener("DOMContentLoaded", () => {
  setupAdminSidebarNav();
  animateAdminCounters();
  renderAdminOrders();
  renderInventoryAlerts();
  renderTopProducts();
  renderAdminNotifications();
  initSalesChart();

  // Refresh Orders Button
  const refreshOrdersBtn = document.getElementById("admin-refresh-orders");
  if (refreshOrdersBtn) {
    refreshOrdersBtn.addEventListener("click", () => {
      refreshOrdersBtn.classList.add("fa-spin");
      setTimeout(() => {
        renderAdminOrders();
        refreshOrdersBtn.classList.remove("fa-spin");
        if (window.NotificationManager) {
          window.NotificationManager.showToast("Order records synchronized.", "info");
        }
      }, 600);
    });
  }

  // Refresh Notifications Button
  const refreshNotifBtn = document.getElementById("admin-refresh-notifs");
  if (refreshNotifBtn) {
    refreshNotifBtn.addEventListener("click", () => {
      refreshNotifBtn.classList.add("fa-spin");
      setTimeout(() => {
        renderAdminNotifications();
        refreshNotifBtn.classList.remove("fa-spin");
        if (window.NotificationManager) {
          window.NotificationManager.showToast("Alerts up to date.", "info");
        }
      }, 500);
    });
  }
});

function animateAdminCounters() {
  const kpiCounters = [
    { id: "admin-kpi-products", target: 128, prefix: "", suffix: "" },
    { id: "admin-kpi-orders", target: 24, prefix: "", suffix: "" },
    { id: "admin-kpi-revenue", target: 8.42, prefix: "₹", suffix: "L" }
  ];

  kpiCounters.forEach(kpi => {
    const el = document.getElementById(kpi.id);
    if (!el) return;

    if (window.gsap) {
      gsap.fromTo(
        { val: 0 },
        { val: kpi.target },
        {
          duration: 1.5,
          ease: "power2.out",
          onUpdate: function() {
            const cur = this.targets()[0].val;
            if (kpi.suffix === "L") {
              el.textContent = `${kpi.prefix}${cur.toFixed(2)}${kpi.suffix}`;
            } else {
              el.textContent = `${kpi.prefix}${Math.floor(cur)}${kpi.suffix}`;
            }
          }
        }
      );
    } else {
      el.textContent = `${kpi.prefix}${kpi.target}${kpi.suffix}`;
    }
  });
}

function renderAdminOrders() {
  const tbody = document.getElementById("admin-recent-orders-tbody");
  if (!tbody) return;

  const orders = window.OrdersManager ? window.OrdersManager.getAll() : [];
  const displayOrders = orders.slice(0, 5);

  tbody.innerHTML = displayOrders.map(order => {
    let statusClass = "status-badge-processing";
    if (order.status === "Delivered" || order.adminStatus === "Delivered") statusClass = "status-badge-delivered";
    if (order.status === "Shipped" || order.adminStatus === "Shipped") statusClass = "status-badge-shipped";

    return `
      <tr>
        <td class="font-mono font-bold text-accent">#${order.orderId}</td>
        <td>
          <div class="table-product-cell">
            <img src="${order.image || 'assets/medicine-01.webp'}" alt="" class="table-thumb">
            <div>
              <div class="table-product-name">${order.productName}</div>
              <small class="text-muted">${order.customerName}</small>
            </div>
          </div>
        </td>
        <td class="font-semibold">₹${order.price.toLocaleString()}</td>
        <td><span class="status-badge ${statusClass}">${order.status}</span></td>
        <td>
          <button class="btn btn-outline-sm btn-icon" onclick="viewOrderModal('${order.orderId}')" title="Inspect Order">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");

  if (window.gsap) {
    gsap.from("#admin-recent-orders-tbody tr", {
      opacity: 0,
      y: 10,
      stagger: 0.05,
      duration: 0.3
    });
  }
}

function viewOrderModal(orderId) {
  window.location.href = "404.html";
}
window.viewOrderModal = viewOrderModal;

function renderInventoryAlerts() {
  const container = document.getElementById("admin-inventory-alerts-list");
  if (!container) return;

  const alerts = [
    {
      name: "Vitamin C 500mg Zinc Complex",
      pack: "30 Tablets",
      left: 3,
      status: "LOW STOCK",
      badgeClass: "badge-warning",
      image: "assets/vitamins-01.webp"
    },
    {
      name: "Omega-3 Wild Fish Oil 1000mg",
      pack: "60 Capsules",
      left: 2,
      status: "LOW STOCK",
      badgeClass: "badge-warning",
      image: "assets/medicine-02.webp"
    },
    {
      name: "Multivitamin & Minerals",
      pack: "30 Tablets",
      left: 0,
      status: "OUT OF STOCK",
      badgeClass: "badge-danger",
      image: "assets/vitamins-02.webp"
    }
  ];

  container.innerHTML = alerts.map(item => `
    <div class="inventory-alert-item">
      <img src="${item.image}" alt="${item.name}" class="alert-thumb">
      <div class="alert-content">
        <h5 class="alert-product-title">${item.name}</h5>
        <p class="alert-meta">${item.pack} • <span class="text-accent font-semibold">${item.left > 0 ? `Only ${item.left} left` : 'Out of stock'}</span></p>
      </div>
      <span class="badge ${item.badgeClass}">${item.status}</span>
    </div>
  `).join("");
}

function renderTopProducts() {
  const container = document.getElementById("admin-top-products-list");
  if (!container) return;

  const topProducts = [
    { rank: "01", name: "Vitamin C 500mg", sold: 142, revenue: "₹70,858", img: "assets/vitamins-01.webp" },
    { rank: "02", name: "Omega 3 Wild Fish Oil", sold: 118, revenue: "₹1,06,082", img: "assets/medicine-02.webp" },
    { rank: "03", name: "Complete Multivitamin", sold: 96, revenue: "₹62,304", img: "assets/vitamins-02.webp" },
    { rank: "04", name: "Wellness Essentials Kit", sold: 81, revenue: "₹1,05,219", img: "assets/wellness-01.webp" },
    { rank: "05", name: "Infrared Thermometer", sold: 74, revenue: "₹1,40,526", img: "assets/equipment.webp" }
  ];

  container.innerHTML = topProducts.map(p => `
    <div class="top-product-row">
      <span class="top-product-rank">${p.rank}</span>
      <img src="${p.img}" alt="${p.name}" class="top-product-thumb">
      <div class="top-product-details">
        <h6 class="top-product-name">${p.name}</h6>
        <span class="top-product-sold">${p.sold} units sold</span>
      </div>
      <span class="top-product-rev text-accent font-semibold">${p.revenue}</span>
    </div>
  `).join("");
}

function renderAdminNotifications() {
  const container = document.getElementById("admin-notifications-list");
  if (!container || !window.NotificationManager) return;

  const list = window.NotificationManager.getAdminNotifications();

  container.innerHTML = list.map(n => `
    <div class="admin-notif-item">
      <div class="notif-indicator notif-type-${n.type}">
        <i class="fa-solid ${n.type === 'order' ? 'fa-bag-shopping' : n.type === 'alert' ? 'fa-triangle-exclamation' : n.type === 'review' ? 'fa-star' : 'fa-arrow-rotate-left'}"></i>
      </div>
      <div class="notif-info">
        <div class="notif-header">
          <h5 class="notif-title">${n.title}</h5>
          <span class="notif-time">${n.time}</span>
        </div>
        <p class="notif-desc">${n.message}</p>
      </div>
    </div>
  `).join("");
}

/**
 * Interactive SVG Sales Performance Chart
 */
function initSalesChart() {
  const chartWrapper = document.getElementById("admin-sales-chart-wrapper");
  if (!chartWrapper) return;

  const datasets = {
    "7d": {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [35, 52, 48, 70, 85, 110, 95],
      totalRev: "₹1.85L",
      orders: "148"
    },
    "30d": {
      labels: ["W1", "W2", "W3", "W4"],
      data: [180, 240, 290, 340],
      totalRev: "₹8.42L",
      orders: "612"
    },
    "3m": {
      labels: ["Aug", "Sep", "Oct"],
      data: [650, 810, 940],
      totalRev: "₹24.10L",
      orders: "1,840"
    },
    "1y": {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      data: [2100, 2700, 3100, 3600],
      totalRev: "₹92.40L",
      orders: "7,350"
    }
  };

  let activePeriod = "30d";

  function drawSVGChart(period) {
    const ds = datasets[period];
    const width = 680;
    const height = 240;
    const padding = 35;
    const maxVal = Math.max(...ds.data) * 1.15;
    const stepX = (width - padding * 2) / (ds.data.length - 1);

    const points = ds.data.map((val, idx) => {
      const x = padding + idx * stepX;
      const y = height - padding - (val / maxVal) * (height - padding * 2);
      return { x, y, val, label: ds.labels[idx] };
    });

    const pathD = points.reduce((acc, p, idx) => {
      if (idx === 0) return `M ${p.x} ${p.y}`;
      // Smooth cubic bezier
      const prev = points[idx - 1];
      const cx1 = prev.x + (p.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (p.x - prev.x) / 2;
      const cy2 = p.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p.x} ${p.y}`;
    }, "");

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const svgHtml = `
      <svg viewBox="0 0 ${width} ${height}" class="sales-svg-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGoldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#B08D57" stop-opacity="0.38"/>
            <stop offset="100%" stop-color="#B08D57" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#262626" stroke-dasharray="3 3"/>
        <line x1="${padding}" y1="${(height - padding * 2) / 2 + padding}" x2="${width - padding}" y2="${(height - padding * 2) / 2 + padding}" stroke="#262626" stroke-dasharray="3 3"/>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#333333"/>

        <!-- Area fill -->
        <path d="${areaD}" fill="url(#chartGoldGrad)" class="chart-area-path"/>

        <!-- Stroke line -->
        <path d="${pathD}" fill="none" stroke="#B08D57" stroke-width="3" stroke-linecap="round" class="chart-line-path"/>

        <!-- Points & Labels -->
        ${points.map(p => `
          <g class="chart-point-group" tabindex="0">
            <circle cx="${p.x}" cy="${p.y}" r="5" fill="#F5F2EA" stroke="#B08D57" stroke-width="2.5" class="chart-point-circle"/>
            <text x="${p.x}" y="${height - 12}" fill="#888888" font-size="12" text-anchor="middle" font-family="'Poppins', sans-serif">${p.label}</text>
            <text x="${p.x}" y="${p.y - 12}" fill="#B08D57" font-size="11" font-weight="600" text-anchor="middle" class="chart-val-label font-mono">${p.val}</text>
          </g>
        `).join("")}
      </svg>
    `;

    chartWrapper.innerHTML = svgHtml;

    if (window.gsap) {
      const line = chartWrapper.querySelector(".chart-line-path");
      if (line) {
        const len = line.getTotalLength ? line.getTotalLength() : 1000;
        gsap.fromTo(line, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1, ease: "power2.out" });
      }
      gsap.fromTo(".chart-point-circle", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.08, duration: 0.5, delay: 0.3 });
    }
  }

  // Initial draw
  drawSVGChart(activePeriod);

  // Time filter buttons
  const timeBtns = document.querySelectorAll(".chart-time-btn");
  timeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      timeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePeriod = btn.getAttribute("data-period");
      drawSVGChart(activePeriod);
    });
  });
}

function setupAdminSidebarNav() {
  const navLinks = document.querySelectorAll(".sidebar-nav-container .sidebar-nav-link");
  const sections = document.querySelectorAll(".admin-dashboard-section");

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
    if (cleanId === "admin-section-dashboard") {
      animateAdminCounters();
      renderInventoryAlerts();
      renderTopProducts();
      renderAdminNotifications();
      initSalesChart();
    } else if (cleanId === "admin-section-orders") {
      renderAdminOrders();
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
    const validIds = [
      "admin-section-dashboard",
      "admin-section-products",
      "admin-section-orders",
      "admin-section-customers",
      "admin-section-settings"
    ];
    if (validIds.includes(hash)) {
      switchSection(hash);
    }
  });

  // Check initial hash on load
  const initialHash = window.location.hash ? window.location.hash.replace("#", "") : "admin-section-dashboard";
  const validIds = [
    "admin-section-dashboard",
    "admin-section-products",
    "admin-section-orders",
    "admin-section-customers",
    "admin-section-settings"
  ];
  if (validIds.includes(initialHash)) {
    switchSection(initialHash);
  } else {
    switchSection("admin-section-dashboard");
  }
}
