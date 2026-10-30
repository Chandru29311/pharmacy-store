/**
 * Main Pharmacy Store Script
 * Core navigation, Cart Drawer, Wishlist, FAQ, GSAP Common animations
 */

const CartManager = {
  STORAGE_KEY: "pharmacy_store_cart",

  getCart() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  saveCart(cart) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.updateBadge();
    this.renderDrawer();
  },

  addItem(productId, qty = 1, customData = null) {
    const cart = this.getCart();
    let product = customData;
    if (!product && window.InventoryManager) {
      product = window.InventoryManager.getById(productId);
    }
    if (!product && typeof productId === 'object' && productId !== null) {
      product = productId;
    }
    if (!product) return;

    const targetId = product.id || productId;
    const existingIndex = cart.findIndex(item => item.id === targetId);
    if (existingIndex > -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push({
        id: targetId,
        name: product.name,
        price: Number(product.price) || 0,
        image: product.image,
        category: product.category || 'Healthcare',
        qty: qty
      });
    }

    this.saveCart(cart);
    this.openDrawer();
    if (window.NotificationManager) {
      window.NotificationManager.showToast(`Added "${product.name}" to Apothecary Basket!`, "success");
    }
  },

  removeItem(productId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== productId);
    this.saveCart(cart);
    if (window.NotificationManager) {
      window.NotificationManager.showToast("Item removed from cart.", "info");
    }
  },

  updateQty(productId, delta) {
    const cart = this.getCart();
    const item = cart.find(i => i.id === productId);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        this.removeItem(productId);
        return;
      }
    }
    this.saveCart(cart);
  },

  getTotalCount() {
    return this.getCart().reduce((sum, item) => sum + item.qty, 0);
  },

  getTotalPrice() {
    return this.getCart().reduce((sum, item) => sum + (item.price * item.qty), 0);
  },

  updateBadge() {
    const badges = document.querySelectorAll(".cart-count-badge");
    const count = this.getTotalCount();
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? "inline-flex" : "none";
    });
  },

  renderDrawer() {
    const listEl = document.getElementById("cart-drawer-items");
    const totalEl = document.getElementById("cart-drawer-total");
    const countEl = document.getElementById("cart-drawer-count");
    if (!listEl) return;

    const cart = this.getCart();
    if (countEl) countEl.textContent = `(${this.getTotalCount()})`;

    if (cart.length === 0) {
      listEl.innerHTML = `
        <div class="empty-cart-state">
          <i class="fa-solid fa-prescription-bottle-medical empty-icon"></i>
          <h4>Your Cart is Empty</h4>
          <p>Explore our healthcare collections and add wellness essentials.</p>
          <a href="Shop.html" class="btn btn-gold btn-sm" onclick="CartManager.closeDrawer()">Shop Now</a>
        </div>
      `;
      if (totalEl) totalEl.textContent = "₹0";
      return;
    }

    listEl.innerHTML = cart.map(item => `
      <div class="cart-drawer-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h5 class="cart-item-title">${item.name}</h5>
          <span class="cart-item-cat">${item.category || 'Healthcare'}</span>
          <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
          <div class="cart-item-qty-row">
            <button class="qty-btn" onclick="CartManager.updateQty('${item.id}', -1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="CartManager.updateQty('${item.id}', 1)">+</button>
            <button class="cart-remove-btn" onclick="CartManager.removeItem('${item.id}')" title="Remove">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    `).join("");

    if (totalEl) {
      totalEl.textContent = `₹${this.getTotalPrice().toLocaleString()}`;
    }
  },

  openDrawer() {
    this.renderDrawer();
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer && overlay) {
      drawer.classList.add("active");
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  },

  closeDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("active");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  clearCart() {
    this.saveCart([]);
  },

  handleCheckout(e) {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    const cart = this.getCart();
    if (!cart || cart.length === 0) {
      if (window.NotificationManager && typeof window.NotificationManager.showToast === "function") {
        window.NotificationManager.showToast("No product added", "error");
      }
      const footer = document.querySelector(".cart-drawer-footer");
      let notice = document.getElementById("cart-checkout-notice");
      if (notice) {
        notice.remove();
      }
      if (footer) {
        notice = document.createElement("div");
        notice.id = "cart-checkout-notice";
        notice.className = "cart-checkout-notice";
        notice.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>No product added</span>';
        footer.insertBefore(notice, footer.firstChild);
        setTimeout(() => {
          if (notice && notice.parentNode) {
            notice.remove();
          }
        }, 3500);
      }
      return false;
    }

    this.clearCart();
    this.closeDrawer();
    window.location.href = "404.html";
    return true;
  }
};

const WishlistManager = {
  STORAGE_KEY: "pharmacy_store_wishlist",

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || ["med-01", "med-02"];
    } catch (e) {
      return ["med-01", "med-02"];
    }
  },

  toggle(productId) {
    let list = this.getAll();
    const index = list.indexOf(productId);
    let added = false;
    if (index > -1) {
      list.splice(index, 1);
      added = false;
    } else {
      list.push(productId);
      added = true;
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    this.updateBadges();

    if (window.NotificationManager) {
      window.NotificationManager.showToast(
        added ? "Saved to your Wishlist." : "Removed from your Wishlist.",
        "info"
      );
    }
    return added;
  },

  isWishlisted(productId) {
    return this.getAll().includes(productId);
  },

  updateBadges() {
    const badges = document.querySelectorAll(".wishlist-count-badge");
    const count = this.getAll().length;
    badges.forEach(b => {
      b.textContent = count;
      b.style.display = count > 0 ? "inline-flex" : "none";
    });
  }
};

// DOM Init
document.addEventListener("DOMContentLoaded", () => {
  // Init Cart and Wishlist Badges
  CartManager.updateBadge();
  WishlistManager.updateBadges();

  // Active Navigation Highlighting
  highlightActiveNav();

  // Mobile Menu Logic
  setupMobileNav();

  // Sticky Navbar Scroll
  setupNavbarScroll();

  // Cart Drawer listeners
  const cartTriggers = document.querySelectorAll(".cart-drawer-trigger");
  cartTriggers.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      CartManager.openDrawer();
    });
  });

  const cartCloseBtn = document.getElementById("cart-drawer-close");
  if (cartCloseBtn) {
    cartCloseBtn.addEventListener("click", () => CartManager.closeDrawer());
  }

  const cartOverlay = document.getElementById("cart-overlay");
  if (cartOverlay) {
    cartOverlay.addEventListener("click", () => CartManager.closeDrawer());
  }

  // Cart Checkout click handler (Event Delegation for all pages)
  document.addEventListener("click", (e) => {
    const checkoutBtn = e.target.closest("#cart-checkout-btn, .cart-checkout-btn, .cart-drawer-footer a, .cart-drawer-footer button");
    if (checkoutBtn && checkoutBtn.closest("#cart-drawer")) {
      e.preventDefault();
      CartManager.handleCheckout(e);
    }
  });

  // Accordion Logic (for FAQ & Information sections)
  setupAccordions();

  // Add to Basket / Cart Event Delegation
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-add-to-basket, .btn-quick-add-basket, .btn-exotic-add-basket, .quick-add-btn");
    if (btn) {
      e.preventDefault();
      const pid = btn.getAttribute("data-product-id") || btn.getAttribute("data-id");
      const name = btn.getAttribute("data-name");
      const price = btn.getAttribute("data-price") ? parseFloat(btn.getAttribute("data-price")) : null;
      const image = btn.getAttribute("data-image");
      const category = btn.getAttribute("data-category");

      const customData = (pid && name && price !== null && image) ? { id: pid, name, price, image, category } : null;

      if (pid) {
        CartManager.addItem(pid, 1, customData);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Added!</span>`;
        btn.classList.add("btn-added");
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.classList.remove("btn-added");
        }, 1400);
      }
    }

    const wishlistBtn = e.target.closest(".wishlist-toggle-btn");
    if (wishlistBtn) {
      e.preventDefault();
      const pid = wishlistBtn.getAttribute("data-id");
      if (pid) {
        const isAdded = WishlistManager.toggle(pid);
        wishlistBtn.classList.toggle("active", isAdded);
        const icon = wishlistBtn.querySelector("i");
        if (icon) {
          icon.className = isAdded ? "fa-solid fa-heart" : "fa-regular fa-heart";
        }
      }
    }
  });

  // Lenis smooth scroll
  initLenisSmoothScroll();

  // Preloader removal
  handlePreloader();

  // GSAP scroll animations
  initGSAPScrollAnimations();

  // AOS scroll animations with mirror: true
  initAOSScrollAnimations();
});

function highlightActiveNav() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

function setupMobileNav() {
  const hamburger = document.getElementById("hamburger-btn");
  const mobileNav = document.getElementById("mobile-menu");
  const mobileOverlay = document.getElementById("mobile-menu-overlay");
  const mobileClose = document.getElementById("mobile-menu-close");

  if (!hamburger || !mobileNav) return;

  function openMenu() {
    hamburger.classList.add("active");
    mobileNav.classList.add("active");
    if (mobileOverlay) mobileOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    if (window.gsap) {
      gsap.fromTo(
        ".mobile-nav-item",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, stagger: 0.06, duration: 0.4, ease: "power2.out" }
      );
    }
  }

  function closeMenu() {
    hamburger.classList.remove("active");
    mobileNav.classList.remove("active");
    if (mobileOverlay) mobileOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", openMenu);
  if (mobileClose) mobileClose.addEventListener("click", closeMenu);
  if (mobileOverlay) mobileOverlay.addEventListener("click", closeMenu);
}

function setupNavbarScroll() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
}

function setupAccordions() {
  const accordionHeaders = document.querySelectorAll(".accordion-header");
  accordionHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const parent = header.closest(".accordion-item");
      const isActive = parent.classList.contains("active");

      // close all siblings if within same accordion
      const container = parent.closest(".accordion");
      if (container) {
        container.querySelectorAll(".accordion-item").forEach(item => {
          item.classList.remove("active");
        });
      }

      if (!isActive) {
        parent.classList.add("active");
      }
    });
  });
}

function handlePreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  // Prevent scroll during initial 3-second synthesis sequence
  document.body.style.overflow = "hidden";
  if (window.lenis) {
    window.lenis.stop();
  }

  const progressBar = document.getElementById("preloader-progress-bar");
  const percentText = document.getElementById("preloader-percent");
  const statusText = document.getElementById("preloader-status");

  const phases = [
    { at: 0, text: "Synthesizing Bio-Active Formulations..." },
    { at: 850, text: "Cold-Extracting Standardized Phytochemicals..." },
    { at: 1750, text: "Verifying Pharmacopeia Rigor & Purity..." },
    { at: 2450, text: "Harmonizing Clinical Sanctuary..." }
  ];

  const startTime = performance.now();
  const duration = 3000; // Exact 3 seconds of formulation time

  function updatePreloader(now) {
    const elapsed = Math.min(now - startTime, duration);
    const progress = Math.min(elapsed / duration, 1);
    const percent = Math.round(progress * 100);

    if (progressBar) {
      progressBar.style.width = percent + "%";
    }
    if (percentText) {
      percentText.textContent = percent + "%";
    }

    if (statusText) {
      for (let i = phases.length - 1; i >= 0; i--) {
        if (elapsed >= phases[i].at) {
          if (statusText.textContent !== phases[i].text) {
            statusText.textContent = phases[i].text;
          }
          break;
        }
      }
    }

    if (elapsed < duration) {
      requestAnimationFrame(updatePreloader);
    } else {
      finishPreloader();
    }
  }

  function finishPreloader() {
    document.body.style.overflow = "";
    if (window.lenis) {
      window.lenis.start();
    }

    if (typeof gsap !== "undefined") {
      gsap.to(preloader, {
        opacity: 0,
        scale: 1.03,
        duration: 0.6,
        ease: "power2.inOut",
        onComplete: () => {
          preloader.style.display = "none";
          preloader.setAttribute("aria-hidden", "true");
          if (typeof ScrollTrigger !== "undefined") {
            ScrollTrigger.refresh();
          }
        }
      });
    } else {
      preloader.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      preloader.style.opacity = "0";
      preloader.style.transform = "scale(1.03)";
      setTimeout(() => {
        preloader.style.display = "none";
        preloader.setAttribute("aria-hidden", "true");
        if (typeof ScrollTrigger !== "undefined") {
          ScrollTrigger.refresh();
        }
      }, 600);
    }
  }

  requestAnimationFrame(updatePreloader);
}

/**
 * Lenis Smooth Scroll Configuration
 * Creates an ultra-smooth, hardware-accelerated momentum scroll
 * perfectly synchronized with GSAP ScrollTrigger, AOS (mirror: true), and sticky header navigation.
 */
let lenisInstance = null;

function initLenisSmoothScroll() {
  if (typeof Lenis === "undefined") return;
  if (lenisInstance) return;

  // Respect user preference for reduced motion
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  lenisInstance = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
    infinite: false
  });

  window.lenis = lenisInstance;

  // Synchronize Lenis with GSAP ticker & lagSmoothing for 100% framerate sync
  if (typeof gsap !== "undefined") {
    gsap.ticker.add((time) => {
      lenisInstance.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Update ScrollTrigger on every Lenis scroll event
  if (typeof ScrollTrigger !== "undefined") {
    lenisInstance.on("scroll", () => {
      ScrollTrigger.update();
    });
  }

  // Handle in-page anchor links with Lenis smooth scrolling (accounting for sticky nav)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId.length > 1 && !targetId.includes("/")) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          lenisInstance.scrollTo(targetEl, { offset: -76 });
        }
      }
    });
  });
}

/**
 * AOS (Animate On Scroll) Animations with Mirror: True
 * Initialized across suitable sections for Home, About, Shop, Services, Blog, and Contact pages.
 * Configured with mirror: true so animations smoothly reverse when scrolling out of view
 * and re-animate when scrolling back, with complete mobile responsive protections.
 */
function initAOSScrollAnimations() {
  if (typeof AOS === "undefined") return;

  AOS.init({
    mirror: true,           // Animates out when scrolling past and re-animates on return
    once: false,            // Ensures continuous bidirectional triggers
    duration: 800,          // Balanced timing for elegance
    offset: 70,             // Offset distance from viewport edge
    easing: "ease-out-cubic",
    disableMutationObserver: false,
    anchorPlacement: "top-bottom"
  });

  // Re-calculate AOS triggers once images and fonts are fully loaded
  window.addEventListener("load", () => {
    AOS.refresh();
  });
}

function initGSAPScrollAnimations() {
  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Hero elements entrance
  const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

  if (document.querySelector(".hero-badge")) {
    heroTl.from(".hero-badge", { y: -20, opacity: 0, duration: 0.7 });
  }
  if (document.querySelector(".hero-headline")) {
    heroTl.from(".hero-headline", { y: 30, opacity: 0, duration: 0.9 }, "-=0.4");
  }
  if (document.querySelector(".hero-subtext")) {
    heroTl.from(".hero-subtext", { y: 20, opacity: 0, duration: 0.7 }, "-=0.5");
  }
  if (document.querySelector(".hero-actions")) {
    heroTl.from(".hero-actions", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4");
  }
  if (document.querySelector(".hero-card")) {
    heroTl.from(".hero-card", { scale: 0.92, opacity: 0, duration: 0.8 }, "-=0.5");
  }

  // Animate stats when in view
  const statNumbers = document.querySelectorAll(".stat-counter");
  if (statNumbers.length > 0 && typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      trigger: ".stats-section",
      start: "top 80%",
      once: true,
      onEnter: () => {
        statNumbers.forEach(el => {
          const target = parseFloat(el.getAttribute("data-target")) || 0;
          const prefix = el.getAttribute("data-prefix") || "";
          const suffix = el.getAttribute("data-suffix") || "";
          gsap.fromTo(
            { val: 0 },
            { val: target },
            {
              duration: 2,
              ease: "power2.out",
              onUpdate: function() {
                const current = this.targets()[0].val;
                if (target >= 1000) {
                  el.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
                } else if (Number.isInteger(target)) {
                  el.textContent = prefix + Math.floor(current) + suffix;
                } else {
                  el.textContent = prefix + current.toFixed(1) + suffix;
                }
              }
            }
          );
        });
      }
    });
  }

  // SVG How It Works timeline draw
  const processLine = document.querySelector(".process-draw-line");
  if (processLine && typeof ScrollTrigger !== "undefined") {
    gsap.fromTo(
      processLine,
      { strokeDashoffset: 1000 },
      {
        strokeDashoffset: 0,
        scrollTrigger: {
          trigger: ".process-section",
          start: "top 70%",
          end: "bottom 80%",
          scrub: 1
        }
      }
    );
  }

  // Index Headings Mirror: True GSAP Animation
  initIndexHeadingsMirrorGSAP();

  // About Headings Mirror: True GSAP Animation (Different 3D Perspective Unfold)
  initAboutHeadingsMirrorGSAP();

  // Shop Headings Mirror: True GSAP Animation (Different Spring-Burst & Precision Stamp)
  initShopHeadingsMirrorGSAP();

  // Services Headings Mirror: True GSAP Animation (Different Clinical Horizon Shutter & Diagnostic Mask)
  initServicesHeadingsMirrorGSAP();

  // Blog Headings Mirror: True GSAP Animation (Different Editorial Press & Kinetic Tilt)
  initBlogHeadingsMirrorGSAP();

  // Contact Headings Mirror: True GSAP Animation (Different Sanctuary Radiance & Aperture Bloom)
  initContactHeadingsMirrorGSAP();

  // Login Headings Mirror: True GSAP Animation (Different Biometric Gateway & Dual-Panel Reveal)
  initLoginHeadingsMirrorGSAP();
}

/**
 * GSAP Heading Animations with Mirror: True for Index Page
 * Animates the 8 designated heading lines with an editorial, staggered entrance
 * when entering the viewport, and smoothly resets/reverses when scrolled out of view ("mirror: true").
 * Fully optimized for all mobile devices without affecting responsive layouts.
 */
function initIndexHeadingsMirrorGSAP() {
  if (typeof gsap === "undefined") return;

  const headingConfigs = [
    {
      container: document.querySelector(".hero-glass-card"),
      items: [".hero-glass-tagline", ".hero-glass-heading"]
    },
    {
      container: document.querySelector(".curated-care-section .section-center-header"),
      items: [".section-eyebrow", ".section-main-title"]
    },
    {
      container: document.querySelector(".favorites-header-row"),
      items: [".favorites-title"]
    },
    {
      container: document.querySelector(".tradition-content"),
      items: [".tradition-eyebrow", ".tradition-title"]
    },
    {
      container: document.querySelector(".exotic-section .section-center-header"),
      items: [".section-eyebrow", ".exotic-heading"]
    },
    {
      container: document.querySelector(".stories-section .section-center-header"),
      items: [".section-eyebrow", ".section-main-title"]
    },
    {
      container: document.querySelector(".how-it-works-section .section-center-header"),
      items: [".section-eyebrow", ".section-main-title"]
    },
    {
      container: document.querySelector(".newsletter-banner-card"),
      items: [".newsletter-title"]
    }
  ];

  const activeGroups = [];
  headingConfigs.forEach(cfg => {
    if (!cfg.container) return;
    const els = [];
    cfg.items.forEach(sel => {
      const el = cfg.container.querySelector(sel);
      if (el) els.push(el);
    });
    if (els.length > 0) {
      activeGroups.push({ container: cfg.container, items: els });
    }
  });

  if (activeGroups.length === 0) return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // Layer promotion for 60/120fps mobile performance
  activeGroups.forEach(g => {
    g.items.forEach(el => {
      el.style.willChange = "transform, opacity";
    });
  });

  // Entrance animation (when entering viewport scrolling down or up)
  function playEntrance(group) {
    gsap.to(group.items, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.85,
      ease: "power3.out",
      stagger: 0.12,
      overwrite: "auto"
    });
  }

  // Mirror: true reverse/reset animation (when leaving viewport above or below)
  function playExit(group) {
    gsap.to(group.items, {
      opacity: 0,
      y: 24,
      scale: 0.985,
      duration: 0.45,
      ease: "power2.in",
      overwrite: "auto"
    });
  }

  // Initial check: if already visible on load (such as Hero heading), animate in immediately;
  // otherwise, prime to initial hidden position.
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  activeGroups.forEach(g => {
    const rect = g.container.getBoundingClientRect();
    const inInitialView = rect.top < windowHeight * 0.85 && rect.bottom > 0;
    if (inInitialView) {
      gsap.fromTo(
        g.items,
        { opacity: 0, y: 24, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out", stagger: 0.12 }
      );
    } else {
      gsap.set(g.items, { opacity: 0, y: 24, scale: 0.985 });
    }
  });

  // Native IntersectionObserver with mirror: true logic
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const group = activeGroups.find(g => g.container === entry.target);
        if (!group) return;

        if (entry.isIntersecting) {
          playEntrance(group);
        } else {
          // Mirror: true - resets when scrolled out of view in either direction
          playExit(group);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -25px 0px"
    });

    activeGroups.forEach(g => observer.observe(g.container));
  }
}

/**
 * GSAP Heading Animations with Mirror: True for About Page
 * Distinct 3D perspective unfold & tracking reveal animation:
 * - Eyebrows glide down from above with letter-spacing tracking expansion.
 * - Main titles unfold forward in 3D perspective space (rotateX + translateY) with organic ease.
 * - Foundation accent line scales out smoothly from center.
 * - Resets smoothly when scrolled out of view in either direction ("mirror: true").
 * - Fully hardware-accelerated for mobile responsiveness without layout shifts or horizontal clipping.
 */
function initAboutHeadingsMirrorGSAP() {
  if (typeof gsap === "undefined") return;

  const headingConfigs = [
    {
      container: document.querySelector(".about-figma-hero-content"),
      eyebrow: ".about-figma-hero-eyebrow",
      title: ".about-figma-hero-title"
    },
    {
      container: document.querySelector(".about-journey-text"),
      eyebrow: ".about-journey-eyebrow",
      title: ".about-journey-title"
    },
    {
      container: document.querySelector(".foundation-header"),
      eyebrow: null,
      title: ".foundation-title",
      accent: ".foundation-accent-line"
    },
    {
      container: document.querySelector(".pipeline-header"),
      eyebrow: ".pipeline-eyebrow",
      title: ".pipeline-title"
    },
    {
      container: document.querySelector(".team-figma-header"),
      eyebrow: null,
      title: ".team-figma-title"
    },
    {
      container: document.querySelector(".about-safety-figma-section .safety-grid > div:first-child"),
      eyebrow: ".safety-eyebrow",
      title: ".safety-title"
    },
    {
      container: document.querySelector(".accreditations-header"),
      eyebrow: ".accreditations-eyebrow",
      title: ".accreditations-title"
    },
    {
      container: document.querySelector(".about-healing-figma-section .healing-grid > div:last-child"),
      eyebrow: ".healing-eyebrow",
      title: ".healing-title"
    }
  ];

  const activeGroups = [];
  headingConfigs.forEach(cfg => {
    if (!cfg.container) return;
    const eyebrowEl = cfg.eyebrow ? cfg.container.querySelector(cfg.eyebrow) : null;
    const titleEl = cfg.title ? cfg.container.querySelector(cfg.title) : null;
    const accentEl = cfg.accent ? cfg.container.querySelector(cfg.accent) : null;

    if (titleEl || eyebrowEl) {
      activeGroups.push({
        container: cfg.container,
        eyebrow: eyebrowEl,
        title: titleEl,
        accent: accentEl
      });
    }
  });

  if (activeGroups.length === 0) return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // GPU layer promotion for 60/120fps mobile scrolling
  activeGroups.forEach(g => {
    if (g.eyebrow) g.eyebrow.style.willChange = "transform, opacity, letter-spacing";
    if (g.title) g.title.style.willChange = "transform, opacity";
    if (g.accent) g.accent.style.willChange = "transform, opacity";
  });

  // Entrance animation (entering view scrolling down or up)
  function playEntrance(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 1,
        y: 0,
        letterSpacing: "0.16em",
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.95,
        ease: "power3.out",
        delay: group.eyebrow ? 0.12 : 0,
        overwrite: "auto"
      });
    }

    if (group.accent) {
      gsap.to(group.accent, {
        opacity: 1,
        scaleX: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.2,
        overwrite: "auto"
      });
    }
  }

  // Mirror: true reverse/reset animation (leaving view in either direction)
  function playExit(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 0,
        y: -16,
        letterSpacing: "0.26em",
        duration: 0.45,
        ease: "power2.in",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 0,
        y: 26,
        rotateX: 20,
        duration: 0.45,
        ease: "power2.in",
        overwrite: "auto"
      });
    }

    if (group.accent) {
      gsap.to(group.accent, {
        opacity: 0,
        scaleX: 0,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto"
      });
    }
  }

  // Initial check: if already in initial viewport (e.g. Hero banner), animate in immediately;
  // otherwise, prime to initial hidden perspective state.
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  activeGroups.forEach(g => {
    const rect = g.container.getBoundingClientRect();
    const inInitialView = rect.top < windowHeight * 0.85 && rect.bottom > 0;

    if (inInitialView) {
      if (g.eyebrow) {
        gsap.fromTo(
          g.eyebrow,
          { opacity: 0, y: -16, letterSpacing: "0.26em" },
          { opacity: 1, y: 0, letterSpacing: "0.16em", duration: 0.85, ease: "power2.out" }
        );
      }
      if (g.title) {
        gsap.fromTo(
          g.title,
          { opacity: 0, y: 26, rotateX: 20, transformPerspective: 800, transformOrigin: "50% 0%" },
          { opacity: 1, y: 0, rotateX: 0, duration: 0.95, ease: "power3.out", delay: g.eyebrow ? 0.12 : 0 }
        );
      }
      if (g.accent) {
        gsap.fromTo(
          g.accent,
          { opacity: 0, scaleX: 0, transformOrigin: "center center" },
          { opacity: 1, scaleX: 1, duration: 0.8, ease: "power2.out", delay: 0.2 }
        );
      }
    } else {
      if (g.eyebrow) gsap.set(g.eyebrow, { opacity: 0, y: -16, letterSpacing: "0.26em" });
      if (g.title) gsap.set(g.title, { opacity: 0, y: 26, rotateX: 20, transformPerspective: 800, transformOrigin: "50% 0%" });
      if (g.accent) gsap.set(g.accent, { opacity: 0, scaleX: 0, transformOrigin: "center center" });
    }
  });

  // Native IntersectionObserver providing mirror: true scroll behavior
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const group = activeGroups.find(g => g.container === entry.target);
        if (!group) return;

        if (entry.isIntersecting) {
          playEntrance(group);
        } else {
          // Mirror: true - resets when scrolled out of view so it re-animates on return
          playExit(group);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -25px 0px"
    });

    activeGroups.forEach(g => observer.observe(g.container));
  }
}

/**
 * GSAP Heading Animations with Mirror: True for Shop Page
 * Distinct Apothecary Spring-Burst & Precision Seal Stamp Animation:
 * - Eyebrows/Badges burst outward from center with dynamic spring easing (scale + letter-spacing expansion).
 * - Main titles descend with precision deceleration from above (y: -22px, scale: 1.04 -> y: 0, scale: 1).
 * - Smoothly resets when scrolled out of view ("mirror: true") in either direction.
 * - 100% fluid and responsive on mobile devices with zero layout shift or horizontal overflow.
 */
function initShopHeadingsMirrorGSAP() {
  if (typeof gsap === "undefined") return;

  const headingConfigs = [
    {
      container: document.querySelector(".shop-hero-content"),
      eyebrow: ".shop-hero-eyebrow",
      title: ".shop-hero-title"
    },
    {
      container: document.querySelector(".spotlight-content"),
      eyebrow: ".spotlight-badge",
      title: ".spotlight-title"
    }
  ];

  const activeGroups = [];
  headingConfigs.forEach(cfg => {
    if (!cfg.container) return;
    const eyebrowEl = cfg.eyebrow ? cfg.container.querySelector(cfg.eyebrow) : null;
    const titleEl = cfg.title ? cfg.container.querySelector(cfg.title) : null;

    if (titleEl || eyebrowEl) {
      activeGroups.push({
        container: cfg.container,
        eyebrow: eyebrowEl,
        title: titleEl
      });
    }
  });

  if (activeGroups.length === 0) return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // GPU layer promotion for 60/120fps mobile scrolling
  activeGroups.forEach(g => {
    if (g.eyebrow) g.eyebrow.style.willChange = "transform, opacity, letter-spacing";
    if (g.title) g.title.style.willChange = "transform, opacity";
  });

  // Entrance animation (entering view scrolling down or up)
  function playEntrance(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 1,
        scale: 1,
        letterSpacing: "0.18em",
        duration: 0.8,
        ease: "back.out(1.6)",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: group.eyebrow ? 0.12 : 0,
        overwrite: "auto"
      });
    }
  }

  // Mirror: true reverse/reset animation (leaving view in either direction)
  function playExit(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 0,
        scale: 0.84,
        letterSpacing: "0.28em",
        duration: 0.45,
        ease: "power2.in",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 0,
        y: -22,
        scale: 1.04,
        duration: 0.45,
        ease: "power2.in",
        overwrite: "auto"
      });
    }
  }

  // Initial check: if already visible on load (e.g. Shop Hero banner), animate in immediately;
  // otherwise, prime to initial hidden state.
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  activeGroups.forEach(g => {
    const rect = g.container.getBoundingClientRect();
    const inInitialView = rect.top < windowHeight * 0.85 && rect.bottom > 0;

    if (inInitialView) {
      if (g.eyebrow) {
        gsap.fromTo(
          g.eyebrow,
          { opacity: 0, scale: 0.84, letterSpacing: "0.28em" },
          { opacity: 1, scale: 1, letterSpacing: "0.18em", duration: 0.85, ease: "back.out(1.6)" }
        );
      }
      if (g.title) {
        gsap.fromTo(
          g.title,
          { opacity: 0, y: -22, scale: 1.04 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out", delay: g.eyebrow ? 0.12 : 0 }
        );
      }
    } else {
      if (g.eyebrow) gsap.set(g.eyebrow, { opacity: 0, scale: 0.84, letterSpacing: "0.28em" });
      if (g.title) gsap.set(g.title, { opacity: 0, y: -22, scale: 1.04 });
    }
  });

  // Native IntersectionObserver providing mirror: true scroll behavior
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const group = activeGroups.find(g => g.container === entry.target);
        if (!group) return;

        if (entry.isIntersecting) {
          playEntrance(group);
        } else {
          // Mirror: true - resets when scrolled out of view in either direction
          playExit(group);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -25px 0px"
    });

    activeGroups.forEach(g => observer.observe(g.container));
  }
}

/**
 * GSAP Heading Animations with Mirror: True for Services Page
 * Distinct Clinical Horizon Shutter & Diagnostic Laser Mask Reveal:
 * - Eyebrows glide laterally from left with tracking condensation (x: -20px -> 0px, letterSpacing: 0.22em -> 0.14em).
 * - Main titles rise through a precision clinical horizon mask (clipPath: inset(0% 0% 100% 0%) -> inset(0% 0% 0% 0%), y: 28px -> 0px).
 * - Descriptions/Subtitles elevate softly with focus reveal (y: 18px -> 0px, opacity: 0 -> 1).
 * - Smoothly resets when scrolled out of view ("mirror: true") in either direction.
 * - 100% fluid and responsive on mobile devices with zero layout shift or horizontal overflow.
 */
function initServicesHeadingsMirrorGSAP() {
  if (typeof gsap === "undefined") return;

  const headingConfigs = [
    {
      container: document.querySelector(".services-figma-hero-content"),
      eyebrow: ".services-figma-hero-eyebrow",
      title: ".services-figma-hero-title",
      desc: ".services-figma-hero-desc"
    },
    {
      container: document.querySelector(".digital-content-area"),
      eyebrow: ".digital-eyebrow",
      title: ".digital-title"
    },
    {
      container: document.querySelector(".compounding-header"),
      eyebrow: ".compounding-eyebrow",
      title: ".compounding-title"
    },
    {
      container: document.querySelector(".guidance-header"),
      eyebrow: ".guidance-eyebrow",
      title: ".guidance-title"
    },
    {
      container: document.querySelector(".ecosystem-grid"),
      eyebrow: ".ecosystem-eyebrow",
      title: ".ecosystem-title"
    },
    {
      container: document.querySelector(".pathways-header"),
      eyebrow: ".pathways-eyebrow",
      title: ".pathways-title"
    },
    {
      container: document.querySelector(".diagnostics-header"),
      eyebrow: null,
      title: ".diagnostics-title",
      desc: ".diagnostics-subtitle"
    },
    {
      container: document.querySelector(".logistics-grid"),
      eyebrow: ".logistics-eyebrow",
      title: ".logistics-title"
    }
  ];

  const activeGroups = [];
  headingConfigs.forEach(cfg => {
    if (!cfg.container) return;
    const eyebrowEl = cfg.eyebrow ? cfg.container.querySelector(cfg.eyebrow) : null;
    const titleEl = cfg.title ? cfg.container.querySelector(cfg.title) : null;
    const descEl = cfg.desc ? cfg.container.querySelector(cfg.desc) : null;

    if (titleEl || eyebrowEl) {
      activeGroups.push({
        container: cfg.container,
        eyebrow: eyebrowEl,
        title: titleEl,
        desc: descEl
      });
    }
  });

  if (activeGroups.length === 0) return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // GPU layer promotion for 60/120fps mobile scrolling
  activeGroups.forEach(g => {
    if (g.eyebrow) g.eyebrow.style.willChange = "transform, opacity, letter-spacing";
    if (g.title) g.title.style.willChange = "transform, opacity, clip-path";
    if (g.desc) g.desc.style.willChange = "transform, opacity";
  });

  // Entrance animation (entering view scrolling down or up)
  function playEntrance(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 1,
        x: 0,
        letterSpacing: "0.14em",
        duration: 0.75,
        ease: "power2.out",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "power3.out",
        delay: group.eyebrow ? 0.12 : 0,
        overwrite: "auto"
      });
    }

    if (group.desc) {
      gsap.to(group.desc, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: group.eyebrow ? 0.24 : 0.14,
        overwrite: "auto"
      });
    }
  }

  // Mirror: true reverse/reset animation (leaving view in either direction)
  function playExit(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 0,
        x: -20,
        letterSpacing: "0.22em",
        duration: 0.4,
        ease: "power2.in",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 0,
        y: 28,
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 0.4,
        ease: "power2.in",
        overwrite: "auto"
      });
    }

    if (group.desc) {
      gsap.to(group.desc, {
        opacity: 0,
        y: 18,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto"
      });
    }
  }

  // Initial check: if already visible on load (e.g. Services Hero banner), animate in immediately;
  // otherwise, prime to initial hidden state.
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  activeGroups.forEach(g => {
    const rect = g.container.getBoundingClientRect();
    const inInitialView = rect.top < windowHeight * 0.85 && rect.bottom > 0;

    if (inInitialView) {
      if (g.eyebrow) {
        gsap.fromTo(
          g.eyebrow,
          { opacity: 0, x: -20, letterSpacing: "0.22em" },
          { opacity: 1, x: 0, letterSpacing: "0.14em", duration: 0.8, ease: "power2.out" }
        );
      }
      if (g.title) {
        gsap.fromTo(
          g.title,
          { opacity: 0, y: 28, clipPath: "inset(0% 0% 100% 0%)" },
          { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.out", delay: g.eyebrow ? 0.12 : 0 }
        );
      }
      if (g.desc) {
        gsap.fromTo(
          g.desc,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", delay: g.eyebrow ? 0.24 : 0.14 }
        );
      }
    } else {
      if (g.eyebrow) gsap.set(g.eyebrow, { opacity: 0, x: -20, letterSpacing: "0.22em" });
      if (g.title) gsap.set(g.title, { opacity: 0, y: 28, clipPath: "inset(0% 0% 100% 0%)" });
      if (g.desc) gsap.set(g.desc, { opacity: 0, y: 18 });
    }
  });

  // Native IntersectionObserver providing mirror: true scroll behavior
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const group = activeGroups.find(g => g.container === entry.target);
        if (!group) return;

        if (entry.isIntersecting) {
          playEntrance(group);
        } else {
          // Mirror: true - resets when scrolled out of view in either direction
          playExit(group);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -25px 0px"
    });

    activeGroups.forEach(g => observer.observe(g.container));
  }
}

/**
 * GSAP Heading Animations with Mirror: True for Blog Page
 * Distinct Editorial Press & Kinetic Baseline Tilt Reveal:
 * - Eyebrows/Badges glide down with tracking expansion (y: -14px -> 0px, letterSpacing: 0.24em -> 0.14em, scale: 0.92 -> 1).
 * - Main titles lift from an organic print angle into crisp alignment (y: 30px -> 0px, rotate: -1.8deg -> 0deg, scale: 0.985 -> 1).
 * - Resets smoothly when scrolled out of view in either direction ("mirror: true").
 * - Fully hardware-accelerated for mobile responsiveness without layout shifts or horizontal clipping.
 */
function initBlogHeadingsMirrorGSAP() {
  if (typeof gsap === "undefined") return;

  const headingConfigs = [
    {
      container: document.querySelector(".blog-hero-content"),
      eyebrow: ".blog-hero-badge",
      title: ".blog-hero-title"
    },
    {
      container: document.querySelector(".blog-insights-header"),
      eyebrow: ".blog-insights-eyebrow",
      title: ".blog-insights-title"
    },
    {
      container: document.querySelector(".blog-deepdive-content"),
      eyebrow: ".blog-deepdive-badge",
      title: ".blog-deepdive-title"
    },
    {
      container: document.querySelector(".blog-monograph-content"),
      eyebrow: ".blog-monograph-eyebrow",
      title: ".blog-monograph-title"
    },
    {
      container: document.querySelector(".blog-voices-header"),
      eyebrow: ".blog-voices-eyebrow",
      title: ".blog-voices-title"
    },
    {
      container: document.querySelector(".blog-subscribe-card"),
      eyebrow: null,
      title: ".blog-subscribe-title"
    }
  ];

  const activeGroups = [];
  headingConfigs.forEach(cfg => {
    if (!cfg.container) return;
    const eyebrowEl = cfg.eyebrow ? cfg.container.querySelector(cfg.eyebrow) : null;
    const titleEl = cfg.title ? cfg.container.querySelector(cfg.title) : null;

    if (titleEl || eyebrowEl) {
      activeGroups.push({
        container: cfg.container,
        eyebrow: eyebrowEl,
        title: titleEl
      });
    }
  });

  if (activeGroups.length === 0) return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // GPU layer promotion for 60/120fps mobile scrolling
  activeGroups.forEach(g => {
    if (g.eyebrow) g.eyebrow.style.willChange = "transform, opacity, letter-spacing";
    if (g.title) g.title.style.willChange = "transform, opacity";
  });

  // Entrance animation (entering view scrolling down or up)
  function playEntrance(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 1,
        y: 0,
        scale: 1,
        letterSpacing: "0.14em",
        duration: 0.75,
        ease: "power2.out",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        duration: 0.95,
        ease: "power3.out",
        delay: group.eyebrow ? 0.12 : 0,
        overwrite: "auto"
      });
    }
  }

  // Mirror: true reverse/reset animation (leaving view in either direction)
  function playExit(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 0,
        y: -14,
        scale: 0.92,
        letterSpacing: "0.24em",
        duration: 0.4,
        ease: "power2.in",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 0,
        y: 30,
        rotate: -1.8,
        scale: 0.985,
        duration: 0.4,
        ease: "power2.in",
        overwrite: "auto"
      });
    }
  }

  // Initial check: if already visible on load (e.g. Hero article), animate in immediately;
  // otherwise, prime to initial hidden state.
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  activeGroups.forEach(g => {
    const rect = g.container.getBoundingClientRect();
    const inInitialView = rect.top < windowHeight * 0.85 && rect.bottom > 0;

    if (inInitialView) {
      if (g.eyebrow) {
        gsap.fromTo(
          g.eyebrow,
          { opacity: 0, y: -14, scale: 0.92, letterSpacing: "0.24em" },
          { opacity: 1, y: 0, scale: 1, letterSpacing: "0.14em", duration: 0.8, ease: "power2.out" }
        );
      }
      if (g.title) {
        gsap.fromTo(
          g.title,
          { opacity: 0, y: 30, rotate: -1.8, scale: 0.985 },
          { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 0.95, ease: "power3.out", delay: g.eyebrow ? 0.12 : 0 }
        );
      }
    } else {
      if (g.eyebrow) gsap.set(g.eyebrow, { opacity: 0, y: -14, scale: 0.92, letterSpacing: "0.24em" });
      if (g.title) gsap.set(g.title, { opacity: 0, y: 30, rotate: -1.8, scale: 0.985 });
    }
  });

  // Native IntersectionObserver providing mirror: true scroll behavior
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const group = activeGroups.find(g => g.container === entry.target);
        if (!group) return;

        if (entry.isIntersecting) {
          playEntrance(group);
        } else {
          // Mirror: true - resets when scrolled out of view in either direction
          playExit(group);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -25px 0px"
    });

    activeGroups.forEach(g => observer.observe(g.container));
  }
}

/**
 * GSAP Heading Animations with Mirror: True for Contact Page
 * Distinct Sanctuary Radiance & Aperture Scale Bloom Reveal:
 * - Eyebrows/Badges bloom outward with tracking expansion (scale: 0.86 -> 1, letterSpacing: 0.30em -> 0.15em).
 * - Main titles elevate through an optical aperture focus bloom (y: 28px -> 0px, scale: 0.90 -> 1, ease: "expo.out").
 * - Hero description rises softly with ambient warmth (y: 18px -> 0px, opacity: 0 -> 1).
 * - Resets smoothly when scrolled out of view in either direction ("mirror: true").
 * - Fully hardware-accelerated for mobile responsiveness without layout shifts or horizontal clipping.
 */
function initContactHeadingsMirrorGSAP() {
  if (typeof gsap === "undefined") return;

  const headingConfigs = [
    {
      container: document.querySelector(".contact-hero-content"),
      eyebrow: ".contact-hero-eyebrow",
      title: ".contact-hero-title",
      desc: ".contact-hero-desc"
    },
    {
      container: document.querySelector(".contact-info-col"),
      eyebrow: null,
      title: ".contact-info-title"
    },
    {
      container: document.querySelector(".contact-form-card"),
      eyebrow: null,
      title: ".contact-form-title"
    },
    {
      container: document.querySelector(".triage-content-box"),
      eyebrow: ".triage-live-badge",
      title: ".triage-title"
    },
    {
      container: document.querySelector(".sanctuary-tour-content"),
      eyebrow: ".sanctuary-tour-eyebrow",
      title: ".sanctuary-tour-title"
    },
    {
      container: document.querySelector(".roadmap-header"),
      eyebrow: ".roadmap-eyebrow",
      title: ".roadmap-title"
    },
    {
      container: document.querySelector(".contact-faq-header"),
      eyebrow: ".contact-faq-eyebrow",
      title: ".contact-faq-title"
    },
    {
      container: document.querySelector(".provider-content-area"),
      eyebrow: ".provider-badge",
      title: ".provider-title"
    }
  ];

  const activeGroups = [];
  headingConfigs.forEach(cfg => {
    if (!cfg.container) return;
    const eyebrowEl = cfg.eyebrow ? cfg.container.querySelector(cfg.eyebrow) : null;
    const titleEl = cfg.title ? cfg.container.querySelector(cfg.title) : null;
    const descEl = cfg.desc ? cfg.container.querySelector(cfg.desc) : null;

    if (titleEl || eyebrowEl) {
      activeGroups.push({
        container: cfg.container,
        eyebrow: eyebrowEl,
        title: titleEl,
        desc: descEl
      });
    }
  });

  if (activeGroups.length === 0) return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // GPU layer promotion for 60/120fps mobile scrolling
  activeGroups.forEach(g => {
    if (g.eyebrow) g.eyebrow.style.willChange = "transform, opacity, letter-spacing";
    if (g.title) g.title.style.willChange = "transform, opacity";
    if (g.desc) g.desc.style.willChange = "transform, opacity";
  });

  // Entrance animation (entering view scrolling down or up)
  function playEntrance(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 1,
        scale: 1,
        letterSpacing: "0.15em",
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.95,
        ease: "expo.out",
        delay: group.eyebrow ? 0.12 : 0,
        overwrite: "auto"
      });
    }

    if (group.desc) {
      gsap.to(group.desc, {
        opacity: 1,
        y: 0,
        duration: 0.85,
        ease: "power2.out",
        delay: group.eyebrow ? 0.22 : 0.12,
        overwrite: "auto"
      });
    }
  }

  // Mirror: true reverse/reset animation (leaving view in either direction)
  function playExit(group) {
    if (group.eyebrow) {
      gsap.to(group.eyebrow, {
        opacity: 0,
        scale: 0.86,
        letterSpacing: "0.30em",
        duration: 0.4,
        ease: "power2.in",
        overwrite: "auto"
      });
    }

    if (group.title) {
      gsap.to(group.title, {
        opacity: 0,
        y: 28,
        scale: 0.90,
        duration: 0.4,
        ease: "power2.in",
        overwrite: "auto"
      });
    }

    if (group.desc) {
      gsap.to(group.desc, {
        opacity: 0,
        y: 18,
        duration: 0.35,
        ease: "power2.in",
        overwrite: "auto"
      });
    }
  }

  // Initial check: if already visible on load (e.g. Hero banner), animate in immediately;
  // otherwise, prime to initial hidden state.
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  activeGroups.forEach(g => {
    const rect = g.container.getBoundingClientRect();
    const inInitialView = rect.top < windowHeight * 0.85 && rect.bottom > 0;

    if (inInitialView) {
      if (g.eyebrow) {
        gsap.fromTo(
          g.eyebrow,
          { opacity: 0, scale: 0.86, letterSpacing: "0.30em" },
          { opacity: 1, scale: 1, letterSpacing: "0.15em", duration: 0.8, ease: "power2.out" }
        );
      }
      if (g.title) {
        gsap.fromTo(
          g.title,
          { opacity: 0, y: 28, scale: 0.90 },
          { opacity: 1, y: 0, scale: 1, duration: 0.95, ease: "expo.out", delay: g.eyebrow ? 0.12 : 0 }
        );
      }
      if (g.desc) {
        gsap.fromTo(
          g.desc,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.85, ease: "power2.out", delay: g.eyebrow ? 0.22 : 0.12 }
        );
      }
    } else {
      if (g.eyebrow) gsap.set(g.eyebrow, { opacity: 0, scale: 0.86, letterSpacing: "0.30em" });
      if (g.title) gsap.set(g.title, { opacity: 0, y: 28, scale: 0.90 });
      if (g.desc) gsap.set(g.desc, { opacity: 0, y: 18 });
    }
  });

  // Native IntersectionObserver providing mirror: true scroll behavior
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const group = activeGroups.find(g => g.container === entry.target);
        if (!group) return;

        if (entry.isIntersecting) {
          playEntrance(group);
        } else {
          // Mirror: true - resets when scrolled out of view in either direction
          playExit(group);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -25px 0px"
    });

    activeGroups.forEach(g => observer.observe(g.container));
  }
}

/**
 * GSAP Heading Animations with Mirror: True for Login Page
 * Distinct Biometric Gateway & Dual-Panel Cipher Reveal:
 * - Sanctuary visual title sweeps from an angled focal trajectory (x: -22px -> 0px, y: 10px -> 0px, scale: 0.96 -> 1).
 * - Member login title slides into place with keycard precision (y: -22px -> 0px, letterSpacing: 0.06em -> -0.02em, scale: 1.04 -> 1).
 * - Subtitle glides up to complete the credential prompt (y: 14px -> 0px, opacity: 0 -> 1).
 * - Resets smoothly when scrolled out of view in either direction ("mirror: true").
 * - Fully hardware-accelerated for mobile responsiveness without layout shifts or horizontal clipping.
 */
function initLoginHeadingsMirrorGSAP() {
  if (typeof gsap === "undefined") return;

  const visualContainer = document.querySelector(".auth-visual-content") || document.querySelector(".auth-visual-panel");
  const formContainer = document.querySelector(".auth-form-panel");

  const activeGroups = [];

  if (visualContainer) {
    const visualTitle = visualContainer.querySelector(".auth-visual-title");
    if (visualTitle) {
      activeGroups.push({
        type: "visual",
        container: visualContainer,
        title: visualTitle
      });
    }
  }

  if (formContainer) {
    const formTitle = formContainer.querySelector(".auth-form-title");
    const formSubtitle = formContainer.querySelector(".auth-form-subtitle");
    if (formTitle || formSubtitle) {
      activeGroups.push({
        type: "form",
        container: formContainer,
        title: formTitle,
        subtitle: formSubtitle
      });
    }
  }

  if (activeGroups.length === 0) return;

  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  // GPU layer promotion for 60/120fps mobile scrolling
  activeGroups.forEach(g => {
    if (g.title) g.title.style.willChange = "transform, opacity";
    if (g.subtitle) g.subtitle.style.willChange = "transform, opacity";
  });

  // Entrance animation (entering view scrolling down or up)
  function playEntrance(group) {
    if (group.type === "visual") {
      if (group.title) {
        gsap.to(group.title, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          overwrite: "auto"
        });
      }
    } else if (group.type === "form") {
      if (group.title) {
        gsap.to(group.title, {
          opacity: 1,
          y: 0,
          scale: 1,
          letterSpacing: "-0.02em",
          duration: 0.85,
          ease: "back.out(1.5)",
          overwrite: "auto"
        });
      }
      if (group.subtitle) {
        gsap.to(group.subtitle, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power2.out",
          delay: 0.12,
          overwrite: "auto"
        });
      }
    }
  }

  // Mirror: true reverse/reset animation (leaving view in either direction)
  function playExit(group) {
    if (group.type === "visual") {
      if (group.title) {
        gsap.to(group.title, {
          opacity: 0,
          x: -22,
          y: 10,
          scale: 0.96,
          duration: 0.35,
          ease: "power2.in",
          overwrite: "auto"
        });
      }
    } else if (group.type === "form") {
      if (group.title) {
        gsap.to(group.title, {
          opacity: 0,
          y: -22,
          scale: 1.04,
          letterSpacing: "0.06em",
          duration: 0.35,
          ease: "power2.in",
          overwrite: "auto"
        });
      }
      if (group.subtitle) {
        gsap.to(group.subtitle, {
          opacity: 0,
          y: 14,
          duration: 0.3,
          ease: "power2.in",
          overwrite: "auto"
        });
      }
    }
  }

  // Initial check: if already visible on load (standard on desktop/tablet), animate in immediately;
  // otherwise, prime to initial hidden state.
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;

  activeGroups.forEach(g => {
    const rect = g.container.getBoundingClientRect();
    const inInitialView = rect.top < windowHeight * 0.85 && rect.bottom > 0;

    if (inInitialView) {
      if (g.type === "visual" && g.title) {
        gsap.fromTo(
          g.title,
          { opacity: 0, x: -22, y: 10, scale: 0.96 },
          { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }
        );
      } else if (g.type === "form") {
        if (g.title) {
          gsap.fromTo(
            g.title,
            { opacity: 0, y: -22, scale: 1.04, letterSpacing: "0.06em" },
            { opacity: 1, y: 0, scale: 1, letterSpacing: "-0.02em", duration: 0.85, ease: "back.out(1.5)" }
          );
        }
        if (g.subtitle) {
          gsap.fromTo(
            g.subtitle,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.75, ease: "power2.out", delay: 0.12 }
          );
        }
      }
    } else {
      if (g.type === "visual" && g.title) {
        gsap.set(g.title, { opacity: 0, x: -22, y: 10, scale: 0.96 });
      } else if (g.type === "form") {
        if (g.title) gsap.set(g.title, { opacity: 0, y: -22, scale: 1.04, letterSpacing: "0.06em" });
        if (g.subtitle) gsap.set(g.subtitle, { opacity: 0, y: 14 });
      }
    }
  });

  // Native IntersectionObserver providing mirror: true scroll behavior
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const group = activeGroups.find(g => g.container === entry.target);
        if (!group) return;

        if (entry.isIntersecting) {
          playEntrance(group);
        } else {
          // Mirror: true - resets when scrolled out of view in either direction
          playExit(group);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -25px 0px"
    });

    activeGroups.forEach(g => observer.observe(g.container));
  }
}

window.CartManager = CartManager;
window.WishlistManager = WishlistManager;
